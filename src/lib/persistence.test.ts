import { test } from 'vitest';
import assert from 'node:assert/strict';

import {
	checkPersisted,
	requestPersistence,
	type PersistenceState,
	type StorageManagerLike
} from './persistence.ts';

/**
 * A stubbed StorageManager that records what was asked of it.
 *
 * The call log is the interesting half. Whether the outcome is right matters less than
 * whether `persist()` was called at all: on Firefox that call is a permission prompt, and
 * a prompt shown at the wrong moment is spent for good.
 */
function stub(options: {
	persisted?: boolean | (() => Promise<boolean>);
	persist?: boolean | (() => Promise<boolean>);
}): StorageManagerLike & { calls: string[] } {
	const calls: string[] = [];

	return {
		calls,
		persisted() {
			calls.push('persisted');
			const value = options.persisted ?? false;
			return typeof value === 'function' ? value() : Promise.resolve(value);
		},
		persist() {
			calls.push('persist');
			const value = options.persist ?? false;
			return typeof value === 'function' ? value() : Promise.resolve(value);
		}
	};
}

test('a browser with no Storage API is reported as unsupported, not refused', async () => {
	// The distinction decides whether Setup says anything: there is no warning worth
	// showing about a guarantee the browser cannot offer in the first place.
	assert.equal(await checkPersisted(undefined), 'unsupported');
	assert.equal(await requestPersistence(undefined), 'unsupported');
});

test('a partial Storage API is unsupported rather than half-used', async () => {
	// Older WebKit shipped `persisted` without `persist`. Calling a missing method would
	// throw where a plain "cannot ask" is the honest answer.
	const persistedOnly = { persisted: () => Promise.resolve(false) } as StorageManagerLike;
	assert.equal(await requestPersistence(persistedOnly), 'unsupported');

	const persistOnly = { persist: () => Promise.resolve(true) } as StorageManagerLike;
	assert.equal(await checkPersisted(persistOnly), 'unsupported');
	assert.equal(await requestPersistence(persistOnly), 'unsupported');
});

test('an origin already persistent is never asked again', async () => {
	const storage = stub({ persisted: true });

	assert.equal(await requestPersistence(storage), 'granted');
	// `persist()` prompts on Firefox. Asking for a permission already held would show a
	// dialogue for no reason, which is the fastest way to be refused next time.
	assert.deepEqual(storage.calls, ['persisted']);
});

test('a granted request reports granted', async () => {
	const storage = stub({ persisted: false, persist: true });

	assert.equal(await requestPersistence(storage), 'granted');
	assert.deepEqual(storage.calls, ['persisted', 'persist']);
});

test('a declined request reports refused', async () => {
	const storage = stub({ persisted: false, persist: false });

	assert.equal(await requestPersistence(storage), 'refused');
	assert.deepEqual(storage.calls, ['persisted', 'persist']);
});

test('checking never asks for anything', async () => {
	// `persisted()` does not prompt, so it is safe on an empty first visit. `persist()` is
	// not, and must not be reached from here.
	const storage = stub({ persisted: false, persist: true });

	assert.equal(await checkPersisted(storage), 'unknown');
	assert.deepEqual(storage.calls, ['persisted']);
});

test('not yet persistent is unknown, not refused', async () => {
	// Reporting a refusal here would put a warning on screen before the question has been
	// put — on an empty first visit, where the answer is simply not in yet.
	assert.equal(await checkPersisted(stub({ persisted: false })), 'unknown');
	assert.equal(await checkPersisted(stub({ persisted: true })), 'granted');
});

test('a thrown error is unknown rather than a warning', async () => {
	const rejects = () => Promise.reject(new Error('storage unavailable'));

	const states: PersistenceState[] = [
		await checkPersisted(stub({ persisted: rejects })),
		await requestPersistence(stub({ persisted: rejects })),
		await requestPersistence(stub({ persisted: false, persist: rejects }))
	];

	// A fault in the API says nothing about eviction. Claiming a refusal from it would tell
	// somebody their data is at risk on the strength of an unrelated failure.
	assert.deepEqual(states, ['unknown', 'unknown', 'unknown']);
});
