/**
 * Calendar export.
 *
 * No web API can schedule a local notification — Notification Triggers was
 * exactly that and was abandoned after a Chrome origin trial. A generated
 * calendar file is the one mechanism that fires local alerts forever, offline,
 * on every platform including iOS, with no server and no notification
 * permission.
 *
 * The trade-off is that it is a snapshot, not a live feed. A calendar quietly
 * reminding someone of last month's dose is worse than no reminder at all, so
 * `scheduleFingerprint` exists to detect staleness and prompt a re-export.
 */

import type { Locale } from './locale.ts';
import { APP_ORIGIN, UID_NAMESPACE } from './app-info.ts';
import type { RegimenState } from './types.ts';
import { activeDoseVersion } from './stock.ts';
import { nextAnniversary } from './anniversary.ts';
import { scheduleForDay } from './schedule.ts';

const CRLF = '\r\n';

/** RFC 5545 requires CRLF, and lines folded at 75 octets. */
function fold(line: string): string {
	if (line.length <= 75) return line;
	const parts: string[] = [line.slice(0, 75)];
	let rest = line.slice(75);
	while (rest.length > 74) {
		parts.push(' ' + rest.slice(0, 74));
		rest = rest.slice(74);
	}
	if (rest.length) parts.push(' ' + rest);
	return parts.join(CRLF);
}

function escapeText(value: string): string {
	return value
		.replace(/\\/g, '\\\\')
		.replace(/;/g, '\\;')
		.replace(/,/g, '\\,')
		.replace(/\n/g, '\\n');
}

function stamp(iso: string, time: string): string {
	return `${iso.replace(/-/g, '')}T${time.replace(':', '')}00`;
}

export interface ScheduleFingerprintOptions {
	locale?: Locale;
	timeZone?: string;
}

/**
 * A stable hash of everything that affects the exported calendar's content.
 *
 * This is deliberately not an event identity. It detects that the calendar is stale and
 * becomes the iCalendar SEQUENCE, while the UID stays stable so re-importing updates an
 * existing reminder instead of creating a second one.
 */
export function scheduleFingerprint(
	state: RegimenState,
	asOf: string,
	options: ScheduleFingerprintOptions = {}
): string {
	const parts: string[] = [];
	const products = new Map(state.products.map((product) => [product.id, product]));

	for (const therapy of [...state.therapies].sort((a, b) => a.id.localeCompare(b.id))) {
		if (therapy.isPrn) continue;
		const version = activeDoseVersion(state.doseVersions, therapy.id, asOf);
		if (!version) continue;
		for (const slot of version.slots) {
			const items = [...slot.items]
				.sort((a, b) => a.productId.localeCompare(b.productId))
				.map((item) => {
					const product = products.get(item.productId);
					return [
						item.productId,
						item.units,
						product?.brandName ?? '',
						product?.strength ?? '',
						product?.strengthUnit ?? ''
					].join(':');
				})
				.join(',');
			parts.push(`${therapy.id}@${slot.time}[${items}]`);
		}
	}
	parts.push(`tx:${state.settings.transplantDate}`);
	parts.push(`locale:${options.locale ?? 'fr'}`);
	parts.push(`tz:${options.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC'}`);

	// FNV-1a: short, stable, and adequate for change detection.
	let hash = 0x811c9dc5;
	for (const char of parts.join('|')) {
		hash ^= char.charCodeAt(0);
		hash = Math.imul(hash, 0x01000193) >>> 0;
	}
	return hash.toString(16).padStart(8, '0');
}

export interface IcsOptions {
	/** Minutes before the dose to alert. Default 0 — at the time. */
	alarmMinutesBefore?: number;
	locale?: Locale;
	/**
	 * IANA zone the dose times are expressed in, e.g. `Europe/Zurich`, `America/Sao_Paulo`.
	 *
	 * This was hardcoded to Europe/Zurich, which meant anyone outside Switzerland got
	 * every medication reminder at the wrong hour — a silent defect, since the calendar
	 * still looked correct in the app that generated it.
	 *
	 * Defaults to the environment's own zone. Anchoring to a zone rather than emitting a
	 * floating time is deliberate: a floating time would follow the clock when travelling
	 * and quietly stretch or compress the gap between doses, whereas an anchored time
	 * keeps the interval the user actually set. What *should* happen on a long-haul flight
	 * is a question for a prescriber, not for this file — see the roadmap.
	 */
	timeZone?: string;
	includeAnniversary?: boolean;
	/** Overridable for deterministic tests. */
	now?: string;
}

/**
 * Where an event came from, and where to go back to.
 *
 * The prefix matters more than it looks. These events land in a calendar alongside
 * everything else in someone's life, they recur daily for years, and a bare
 * "Medication — 07:30" gives no clue what created it or how to change it. A year later,
 * looking at a reminder you no longer recognise, `[Graftful]` is the difference between
 * fixing it and deleting it.
 *
 * The link carries `?src=ics` so it is possible to tell how people arrive — a calendar
 * entry shared with somebody else is the most likely way this app spreads, and that is
 * worth being able to see.
 */
const APP_URL = `${APP_ORIGIN}/?src=ics`;
const PREFIX = '[Graftful]';

const LABELS = {
	fr: {
		manage: 'Modifier ou réexporter : ',
		dose: 'Médicaments',
		anniversary: 'Anniversaire de la transplantation',
		take: 'À prendre'
	},
	en: {
		manage: 'Change or re-export: ',
		dose: 'Medication',
		anniversary: 'Transplant anniversary',
		take: 'Take'
	},
	de: {
		manage: 'Ändern oder neu exportieren: ',
		dose: 'Medikamente',
		anniversary: 'Jahrestag der Transplantation',
		take: 'Einnehmen'
	},
	pt: {
		manage: 'Alterar ou reexportar: ',
		dose: 'Medicamentos',
		anniversary: 'Aniversário do transplante',
		take: 'Tomar'
	},
	it: {
		manage: 'Modificare o riesportare: ',
		dose: 'Farmaci',
		anniversary: 'Anniversario del trapianto',
		take: 'Da assumere'
	}
} as const;

/**
 * Build an .ics with one daily recurring event per dose slot, each carrying a
 * VALARM, plus an optional yearly anniversary event.
 *
 * PRN therapies are excluded: there is no schedule to encode.
 */
export function buildIcs(state: RegimenState, asOf: string, options: IcsOptions = {}): string {
	const locale = options.locale ?? 'fr';
	// ECMA-402 rather than a browser API, so this stays usable from the domain layer.
	const timeZone = options.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC';
	const labels = LABELS[locale];
	const alarm = options.alarmMinutesBefore ?? 0;
	const fingerprint = scheduleFingerprint(state, asOf, { locale, timeZone });
	const sequence = Number.parseInt(fingerprint, 16);
	const dtstamp = `${(options.now ?? asOf).replace(/-/g, '')}T000000Z`;

	const lines: string[] = [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		'PRODID:-//Graftful//Reminders//EN',
		'CALSCALE:GREGORIAN',
		'METHOD:PUBLISH',
		`X-WR-CALNAME:Graftful`
	];

	for (const slot of scheduleForDay(state, asOf)) {
		const description = slot.entries
			.flatMap((entry) =>
				entry.items.map(
					(item) => `${item.units} × ${item.brandName} ${item.strength}${item.strengthUnit}`
				)
			)
			.join('\n');

		lines.push(
			'BEGIN:VEVENT',
			/*
			 * Identity is the dose time, not the content fingerprint. A composition change at
			 * 07:30 should update the 07:30 reminder when the file is imported again, not create
			 * a second reminder beside it. The fingerprint belongs in SEQUENCE: it says the
			 * existing event changed without changing which event it is.
			 *
			 * A time being removed is the one case an import cannot clean up portably; Setup tells
			 * the user to remove old Graftful reminders first when times changed.
			 */
			`UID:graftful-dose-${slot.time.replace(':', '')}@${UID_NAMESPACE}`,
			`SEQUENCE:${sequence}`,
			`DTSTAMP:${dtstamp}`,
			`DTSTART;TZID=${timeZone}:${stamp(asOf, slot.time)}`,
			'DURATION:PT5M',
			'RRULE:FREQ=DAILY',
			fold(`SUMMARY:${escapeText(`${PREFIX} ${labels.dose} — ${slot.time}`)}`),
			fold(`DESCRIPTION:${escapeText(`${description}\n\n${labels.manage}${APP_URL}`)}`),
			`URL:${APP_URL}`,
			'BEGIN:VALARM',
			`TRIGGER:-PT${alarm}M`,
			'ACTION:DISPLAY',
			fold(`DESCRIPTION:${escapeText(labels.take)}`),
			'END:VALARM',
			'END:VEVENT'
		);
	}

	if (options.includeAnniversary !== false && state.settings.transplantDate) {
		const { on, years } = nextAnniversary(state.settings.transplantDate, asOf);
		lines.push(
			'BEGIN:VEVENT',
			`UID:graftful-anniversary@${UID_NAMESPACE}`,
			`DTSTAMP:${dtstamp}`,
			`DTSTART;VALUE=DATE:${on.replace(/-/g, '')}`,
			'RRULE:FREQ=YEARLY',
			fold(`SUMMARY:${escapeText(`${PREFIX} ${labels.anniversary} (${years})`)}`),
			`URL:${APP_URL}`,
			'BEGIN:VALARM',
			/*
			 * Positive, so it is relative to the start of the day itself. This was `-PT540M`,
			 * which on an all-day event counts back from midnight and fired the reminder at
			 * 15:00 the *previous* day — a transplant anniversary arriving a day early, which
			 * is exactly the kind of quiet wrongness nobody reports and everybody notices.
			 */
			'TRIGGER:PT9H',
			'ACTION:DISPLAY',
			fold(`DESCRIPTION:${escapeText(labels.anniversary)}`),
			'END:VALARM',
			'END:VEVENT'
		);
	}

	lines.push('END:VCALENDAR');
	return lines.join(CRLF) + CRLF;
}
