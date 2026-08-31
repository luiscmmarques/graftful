import type { Messages } from './messages.ts';

/**
 * Portuguese (Portugal).
 *
 * European Portuguese, not Brazilian: "comprimidos" and "caixa" are shared, but the
 * register and the second person differ. Treatment is formal throughout, consistent with
 * the French and German.
 */
export const pt: Messages = {
	nav: {
		today: 'Hoje',
		stock: 'Stock',
		order: 'Encomenda',
		setup: 'Configuração',
		sections: 'Secções'
	},
	footer: {
		menu: 'Menu',
		about: 'Sobre',
		roadmap: 'Planos',
		privacy: 'Privacidade',
		support: 'Apoiar'
	},
	header: {
		elapsed: (days, years, months, d) =>
			`Dia ${days} · ${years} a ${months} m ${d} d desde o transplante`,
		milestoneToday: (label) => `Hoje é ${label}.`,
		milestoneIn: (label, days) => `${label} dentro de ${days} ${days === 1 ? 'dia' : 'dias'}.`,
		anniversaryLabel: (years) => `${years} ${years === 1 ? 'ano' : 'anos'} desde o seu transplante`,
		dayLabel: (day) => `o dia ${day}`
	},
	common: {
		loading: 'A carregar…',
		close: 'Fechar',
		none: 'Ainda nenhum.',
		notInUse: 'não utilizado',
		days: 'dias'
	},
	today: {
		title: 'Hoje',
		emptyTitle: 'Ainda não há nada configurado',
		emptyBody:
			'O Graftful guarda o seu esquema de medicação e o stock de comprimidos neste dispositivo. Nada é enviado e não existe conta.',
		loadExample: 'Carregar exemplo',
		setUpManually: 'Configurar manualmente',
		exampleNote:
			'O exemplo usa nomes de medicamentos inventados, mas a estrutura é real: onze produtos, duas doses compostas por vários comprimidos, meio comprimido e um analgésico em SOS. Útil para ver como funciona antes de introduzir os seus dados.',
		needsReorder: (count) =>
			count === 1
				? '1 produto precisa de ser encomendado.'
				: `${count} produtos precisam de ser encomendados.`,
		openOrder: 'Ver a encomenda →',
		asNeeded: 'Em SOS',
		noFixedSchedule: 'sem horário fixo',
		summary: (pills, slots) =>
			`${pills} comprimidos por dia, em ${slots} ${slots === 1 ? 'toma' : 'tomas'}.`
	},
	stock: {
		title: 'Stock',
		empty: 'Ainda não há produtos. Adicione-os em Configuração.',
		orderNow: 'encomendar agora',
		runningLow: 'a acabar',
		perBox: (size) => `${size} por caixa`,
		left: (units) => `${units} restantes`,
		perDay: (units) => `${units} por dia`,
		nothingConsumes: 'Nada consome este produto: suspenso, ou apenas em SOS',
		onOrder: (units) => `${units} encomendadas`,
		openActions: 'Repor, recontar ou corrigir a caixa',
		refillLabel: (size) => `Repor, em caixas de ${size}`,
		addUnits: (units) => `Adicionar ${units} unidades`,
		recountLabel: 'Recontar: unidades realmente na caixa',
		setTo: (units) => `Definir para ${units}`,
		refillVsRecount:
			'Repor acrescenta ao que está registado. Recontar substitui. Use isso quando a contagem se afastou da realidade.',
		boxSizeLabel: 'Unidades por caixa, tal como a farmácia a entrega',
		boxSizeUnchanged: 'Tamanho da caixa inalterado',
		correctTo: (size) => `Corrigir para ${size}`,
		boxSizeNote:
			'No início ninguém sabe. Descobre-se na farmácia, por vezes só quando a caixa chega. Corrija aqui quando souber o número verdadeiro. Isso altera quantas caixas as próximas encomendas pedem; não altera o que já tem.'
	}
};
