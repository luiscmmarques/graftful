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
		stockLabelled: (state) => `Stock: ${state}`,
		stockEnough: 'suficiente',
		days: 'dias',
		save: 'Guardar',
		edit: 'Editar',
		errorPackageSize: 'As unidades por caixa têm de ser um número inteiro, pelo menos 1.'
	},
	today: {
		title: 'Hoje',
		metaDescription: 'O que tomar hoje, e quando.',
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
		metaDescription: 'Quantos comprimidos restam e por quanto tempo duram.',
		empty: 'Ainda não há produtos. Adicione-os em Configuração.',
		orderNow: 'encomendar',
		runningLow: 'a acabar',
		perBox: (size) => `${size} por caixa`,
		left: (units) => `${units} restantes`,
		perDay: (units) => `${units} por dia`,
		nothingConsumes: 'Nada consome este produto: suspenso, ou apenas em SOS',
		onOrder: (units) => `${units} encomendadas`,
		openActions: 'Alterar',
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
			'No início ninguém sabe. Descobre-se na farmácia, por vezes só quando a caixa chega. Corrija aqui quando souber o número verdadeiro. Isso altera quantas caixas as próximas encomendas pedem; não altera o que já tem.',
		errorBoxes: 'As caixas têm de ser um número inteiro, pelo menos 1.',
		errorCount: 'Uma contagem não pode ser negativa.'
	},
	order: {
		title: 'Encomenda',
		metaDescription: 'Preparar uma encomenda na farmácia antes de acabar.',
		nothingNeeded: 'Não há nada a encomendar.',
		nextRunAround: (date) => `A próxima ida à farmácia é esperada por volta de ${date}.`,
		nothingConsumedYet: 'Ainda não há nenhum produto a ser consumido.',
		forceOrder: 'Encomendar tudo mais cedo mesmo assim',
		atReorderPoint: (count) =>
			count === 1
				? '1 produto está no ponto de encomenda ou abaixo dele.'
				: `${count} produtos estão no ponto de encomenda ou abaixo dele.`,
		daysLeft: (days) => `${days} dias restantes`,
		jointNote:
			'Tudo o resto é reposto até ao mesmo horizonte, para que a próxima encomenda seja uma única ida à farmácia em vez de várias.',
		addAnythingTitle: 'Acrescentar mais alguma coisa?',
		addAnythingNote:
			'Nada os consome de forma programada, por isso nenhum cálculo os vai pedir, mas também acabam. Vale a pena repor enquanto encomenda.',
		boxesOf: (size) => `caixas de ${size}`,
		oneBoxFewer: 'Uma caixa menos',
		oneBoxMore: 'Uma caixa mais',
		suggestedTitle: 'Encomenda sugerida',
		whenReadyLabel: 'Para quando a deseja pronta? (opcional)',
		whenReadyPlaceholder: 'sexta-feira de manhã',
		capped: 'limitado',
		addedByYou: 'acrescentado por si',
		coversTo: (days) => `cobre ${days} dias`,
		nextRunAfter: (date) =>
			`Depois desta encomenda, a próxima ida é esperada por volta de ${date}.`,
		copied: 'Copiado',
		copyText: 'Copiar o texto da encomenda',
		openInEmail: 'Abrir no e-mail',
		markOrdered: 'Marcar como encomendado',
		markOrderedNote:
			'Marcar como encomendado guarda o pedido e termina o aviso. Não altera o seu stock: isso acontece quando a encomenda chega.',
		fullText: 'Texto completo da encomenda',
		awaitingTitle: 'A aguardar recolha',
		outstanding: (units, date) => `${units} unidades pendentes, encomendadas a ${date}`,
		receivedFull: 'Recebido na totalidade',
		receivedOneBox: 'Recebida apenas 1 caixa',
		partialNote:
			'Estes produtos são muitas vezes dispensados em quantidade incompleta. Registar uma entrega parcial mantém o restante visível em vez de o perder sem aviso.',
		fixBoxSize: 'Se a caixa tinha outro tamanho, corrija-o em Stock →'
	},
	setup: {
		title: 'Configuração',
		metaDescription: 'Os seus produtos, doses, avisos e cópias de segurança.',

		remindersTitle: 'Avisos',
		icsNever:
			'Nenhuma API web permite programar uma notificação localmente, por isso os avisos passam pelo calendário do seu telefone. Exporte uma vez e importe o ficheiro na aplicação de calendário.',
		icsStaleTitle: 'O seu calendário está desatualizado.',
		icsStaleBody:
			'O esquema, o idioma ou o fuso horário mudaram desde a última exportação. Exporte de novo e volte a importar. Os avisos existentes às mesmas horas serão atualizados; se uma hora foi removida ou alterada, apague primeiro o aviso antigo do Graftful do seu calendário.',
		icsCurrent: 'O seu calendário corresponde ao esquema atual.',
		exportIcs: 'Exportar avisos (.ics)',
		icsNote:
			'A medicação em SOS fica de fora, porque não há horário para pôr num calendário. As notificações push, com um botão «tomado», chegam numa versão posterior.',

		languageTitle: 'Idioma',
		languageLabel: 'Idioma da aplicação, da encomenda à farmácia e da exportação de calendário',
		followBrowser: (language) => `Seguir o meu navegador (${language})`,
		languageNote:
			'Isto define o idioma dos ecrãs e das duas coisas que saem da aplicação: a encomenda que envia à farmácia e o ficheiro de calendário. Pode assim enviar uma encomenda em francês a partir de um telefone em inglês.',

		timesTitle: 'As suas horas habituais',
		timesLabel: 'Quando costuma tomar a medicação, separadas por vírgulas',
		saveTimes: 'Guardar as horas',
		errorNotATime: (values) => `Não é uma hora: ${values}. Use HH:MM, por exemplo 08:00.`,
		errorNoTime: 'Indique pelo menos uma hora, por exemplo 08:00.',
		timesNote:
			'Usadas apenas para preencher as horas quando acrescenta algo novo. Cada dose mantém as suas e pode alterar qualquer uma individualmente. Indique o que combinou com o seu centro; o Graftful não sugere intervalos, porque a distância entre as suas tomas é uma decisão de quem lhe prescreve.',

		detailsTitle: 'As suas informações',
		transplantDate: 'Data do transplante',
		horizonLabel: 'Horizonte de reposição em dias: quanto tempo uma encomenda deve cobrir',
		showMilestonesLabel: 'Mostrar marcos no cabeçalho',
		showMilestonesNote:
			'Contagens redondas de dias, como 1000 dias, aparecem no topo do ecrã quando se aproximam. A contagem de dias em si mantém-se de qualquer forma.',
		errorBadDate: 'Essa data não existe. Use AAAA-MM-DD.',
		errorHorizon: 'O horizonte tem de ser um número inteiro de dias, pelo menos 1.',

		productsTitle: 'Produtos',
		reorderAt: (days) => `encomendar a ${days} d`,
		retired: 'suspenso',
		brandName: 'Nome comercial',
		strength: 'Dosagem',
		unit: 'Unidade',
		unitWholePill: 'cp (comprimido inteiro)',
		unitsPerBox: 'Unidades por caixa',
		unitsPerBoxAsk: 'Unidades por caixa (pergunte na farmácia)',
		reorderFloor: 'Limite de encomenda (dias)',
		form: 'Forma (opcional)',
		formPlaceholder: 'comprimido, cápsula…',
		saveChanges: 'Guardar alterações',
		errorProductFields:
			'Verifique o nome, a dosagem, as unidades por caixa e o limite de encomenda — cada um tem de ser um número positivo.',
		confirmDeleteProduct: 'Apagar este produto definitivamente?',
		errorCouldNotDelete: 'Não foi possível apagar',
		restoreProduct: 'Voltar a usar este produto',
		restoreProductNote:
			'Restaurá-lo volta a incluí-lo nos cálculos do esquema e na lista de encomenda.',
		retire: 'Suspender',
		retireNote:
			'Suspender é a forma de deixar de usar algo. Fica no seu historial, mantém o stock e as encomendas anteriores continuam a fazer sentido. Apenas sai das encomendas. É a escolha certa quando uma dosagem é descontinuada ou uma dose muda.',
		deletePermanently: 'Apagar definitivamente',
		deleteProductNote:
			'Nada se refere a este produto, por isso apagá-lo não perde nada. Use isto para algo introduzido por erro.',
		cannotDeleteProduct: (doses, stockEvents, orders) =>
			`Não é possível apagar: aparece em ${doses} ${doses === 1 ? 'dose' : 'doses'}, ${stockEvents} ${stockEvents === 1 ? 'registo' : 'registos'} de stock e ${orders} ${orders === 1 ? 'encomenda' : 'encomendas'}. Removê-lo deixaria um historial que já não bate certo. Suspenda-o em vez disso.`,
		addProduct: 'Acrescentar um produto',
		unitsOnHand: 'Unidades disponíveis',
		addProductButton: 'Acrescentar produto',
		errorProductName: 'Dê um nome ao produto.',
		errorStrength: 'A dosagem tem de ser um número positivo.',
		errorMinDays: 'O limite de encomenda tem de ser um número inteiro de dias.',
		errorStockNegative: 'As unidades disponíveis não podem ser negativas.',
		addProductNote:
			'Se ainda não sabe o tamanho da caixa, indique a sua melhor estimativa. Pode corrigi-lo aqui ou em Stock quando a farmácia lhe disser, e só afeta quantas caixas uma encomenda pede.',

		therapiesTitle: 'Terapias',
		asNeededInline: 'em SOS',
		doseVersions: (count) => `${count} ${count === 1 ? 'versão de dose' : 'versões de dose'}`,
		stoppedOn: (date) => `parado a ${date}`,
		name: 'Nome',
		category: 'Categoria',
		activeIngredient: 'Substância ativa (opcional)',
		activeIngredientPlaceholder: 'a toma da manhã',
		startedOn: 'Iniciado a',
		asNeededCheckbox: 'Em SOS (sem horário)',
		saveDetails: 'Guardar informações',
		doseHistoryTitle: 'Historial de doses',
		now: 'agora',
		perDayUnit: (amount, unit) => `${amount} ${unit}/dia`,
		doseMismatch: (declared, composed, unit) =>
			`Registado como ${declared} ${unit} prescritos, mas os produtos indicados somam ${composed} ${unit}. Vale a pena confirmar com a sua receita.`,
		changeDoseTitle: 'Alterar a dose',
		changeDoseNote:
			'Introduza o que vai realmente tomar. O total é calculado a partir disso, nunca ao contrário, porque só quem lhe prescreve pode decidir como uma dose é composta.',
		firstDayLabel: 'Primeiro dia da nova dose',
		time: 'Hora',
		removeTime: 'Remover a hora',
		product: 'Produto',
		retiredParen: '(suspenso)',
		pills: 'Comprimidos',
		removeProduct: 'Remover este produto',
		addProductHere: 'Acrescentar um produto aqui',
		addAnotherTime: 'Acrescentar outra hora',
		declaredLabel: 'O que o médico disse (opcional)',
		entryComesTo: 'O que introduziu corresponde a',
		perDayAmount: (amount, unit) => `${amount} ${unit} por dia`,
		declaredMismatch: (declared, unit) =>
			`, o que não corresponde aos ${declared} ${unit} que registou.`,
		retiredWarning: (names, count) =>
			count === 1
				? `${names} está suspenso. Guardar isto volta a colocá-lo em uso, pelo que será agendado e encomendado outra vez.`
				: `${names} estão suspensos. Guardar isto volta a colocá-los em uso, pelo que serão agendados e encomendados outra vez.`,
		saveNewDose: 'Guardar a nova dose',
		errorBadStartDate: 'Essa data de início não existe. Use AAAA-MM-DD.',
		errorSlotTime: (value) => `«${value}» não é uma hora. Use HH:MM, por exemplo 08:00.`,
		errorUnits: 'Cada produto precisa de uma quantidade superior a zero.',
		errorChooseProduct: 'Escolha um produto para cada linha.',
		errorSaveDose: 'Não foi possível guardar a dose',
		changeDoseFooter:
			'A dose que toma agora fica no seu historial, terminando no dia anterior ao início desta. Os seus avisos de calendário terão de ser exportados de novo depois.',
		resumeTherapy: 'Voltar a tomar esta terapia',
		stopTherapy: 'Parar esta terapia',
		stopTherapyNote:
			'Parar termina o consumo a partir de hoje e mantém todas as doses registadas, para que o que tomou e quando continue a poder ser consultado.',
		cannotDeleteTherapy: (since, doses) =>
			doses === 1
				? `Não é possível apagar: está em uso desde ${since}, e a sua dose registada é o registo do que tomou. Pare-a em vez disso.`
				: `Não é possível apagar: está em uso desde ${since}, e as suas ${doses} doses registadas são o registo do que tomou. Pare-a em vez disso.`,
		confirmDeleteTherapy: 'Apagar esta terapia e as suas doses?',
		addTherapy: 'Acrescentar uma terapia',
		timesCommaLabel: 'Horas, separadas por vírgulas',
		addTherapyDoseNote:
			'O que tomar a cada uma dessas horas. Uma dose pode combinar produtos: 14 mg da toma da manhã são 3 × 4 mg mais 1 × 2 mg.',
		pillsPerTime: 'Comprimidos por toma',
		addProductToDose: 'Acrescentar um produto a esta dose',
		sameCombinationNote: (changeDoseLabel) =>
			`A mesma combinação é usada a todas as horas indicadas. Para doses diferentes de manhã e à noite, acrescente-a aqui e use depois ${changeDoseLabel} acima, que edita cada hora separadamente.`,
		addTherapyButton: 'Acrescentar terapia',
		errorTherapyName: 'Dê um nome à terapia.',
		errorTimes: 'Verifique as horas: use HH:MM, por exemplo 08:00.',
		errorProductQuantity: 'Escolha um produto e uma quantidade positiva para cada linha.',

		dataTitle: 'Os seus dados',
		dataNote:
			'Tudo é guardado neste dispositivo. Apagar os dados do navegador apaga-os, por isso guarde uma cópia de segurança.',
		storageNotGuaranteed:
			'Este navegador não garante que os dados guardados aqui sejam permanentes; podem ser removidos se o dispositivo ficar sem espaço. A proteção contra isso é exportar uma cópia de segurança de vez em quando.',
		exportBackup: 'Exportar cópia de segurança (JSON)',
		importBackup: 'Importar cópia de segurança',
		errorNothingToExport:
			'Ainda não há nada a exportar — não existe nenhum esquema neste dispositivo.',
		errorImportFailed: 'A importação falhou',
		confirmImport:
			'Importar esta cópia de segurança substitui todos os produtos, doses, contagens de stock e encomendas neste dispositivo. Continuar?',
		restoredWithProblems: (count) =>
			`Restaurado, com ${count} ${count === 1 ? 'problema' : 'problemas'}:`,

		dangerTitle: 'Atenção',
		deleteAll: 'Apagar todos os dados',
		deleting: 'A apagar…',
		confirmDeleteAll: 'Apagar tudo neste dispositivo?',
		deleteDone: 'Tudo neste dispositivo foi apagado.',
		errorDeleteFailed: 'A eliminação falhou'
	},
	about: {
		title: 'Sobre o Graftful',
		metaDescription: 'O que o Graftful faz, o que não faz deliberadamente, e quem o construiu.',
		intro:
			'O Graftful ajuda quem faz medicação de longa duração a acompanhar o que tomar, quanto resta e quando encomendar. Foi construído para pessoas transplantadas, que tomam os mesmos medicamentos todos os dias para o resto da vida e para quem ficar sem eles não é um pequeno incómodo.',
		introNote:
			'É gratuito, não tem conta, não tem publicidade e funciona sem ligação à internet. Nada sobre a sua saúde sai do seu dispositivo.',
		purposeTitle: 'Para que serve',
		purposeStatement:
			'O Graftful é uma ferramenta de autogestão para pessoas que fazem medicação de longa duração. Guarda um esquema de medicação introduzido pelo utilizador, avisa quando uma toma é devida, acompanha quantos comprimidos restam e ajuda a preparar uma encomenda na farmácia. Não presta conselhos médicos, não interpreta dados clínicos e não determina nem sugere qualquer dose.',
		notTitle: 'O que deliberadamente não fará',
		notIntro:
			'Não são funcionalidades em falta. São o limite que mantém isto como ferramenta de acompanhamento e não como algo que teria de ser regulado como dispositivo médico. E, mais simplesmente, são decisões de quem lhe prescreve e não de uma aplicação.',
		notDoseLead: 'Calcular uma dose',
		notDoseBody: 'a partir de um nível sanguíneo, do seu peso ou de qualquer análise.',
		notCombinationLead: 'Decidir que comprimidos compõem uma dose.',
		notCombinationBody:
			'Dito «14 mg», não vai decidir que isso significa três cápsulas de 4 mg e uma de 2 mg. É o utilizador que introduz o que lhe foi prescrito. Há razões clínicas reais para se escolher uma combinação em particular.',
		notMissedDoseLead: 'Dizer-lhe o que fazer quando falha uma toma.',
		notMissedDoseBody:
			'Vai mostrar-lhe que uma toma foi falhada e a que hora era devida. O que fazer a seguir é uma questão para o seu centro de transplantação.',
		notInteractions: 'Avisar sobre interações medicamentosas.',
		notLabResultLead: 'Interpretar uma análise.',
		notLabResultBody:
			'Registar um nível vale como entrada de diário, e isso não tem problema. Pintá-lo de vermelho, ou chamar-lhe «fora do intervalo», é um juízo que esta aplicação não faz.',
		notDatabaseLead: 'Vir com uma base de dados de medicamentos.',
		notDatabaseBody:
			'Todas as doses no Graftful foram introduzidas por si, por isso nunca é a origem de um número clínico.',
		arithmeticNote:
			'Faz contas com os números que introduziu: quantos dias o seu stock vai durar e quantas caixas pedir na farmácia. Se registar uma dose total e os comprimidos indicados não somarem esse valor, o Graftful diz que os dois não coincidem. Compara os seus próprios dois números e nunca decide qual está certo.',
		nameTitle: 'De onde vem o nome',
		nameGraft:
			'«Graft», em inglês, é o próprio órgão transplantado: o rim, o fígado, o coração ou o pulmão que alguém lhe deu. A palavra é mais antiga do que a medicina: vem da horticultura, onde enxertar significa unir tecido vivo de uma planta a outra para que as duas cresçam como uma só. Que é exactamente o que é um transplante.',
		nameFul:
			'«-ful» é o sufixo inglês comum que significa «cheio de». Graftful quer portanto dizer «cheio de enxerto», e fica perto o suficiente de «grateful», grato, para não ser por acaso. Quem tem um, sabe porquê.',
		nameNotOrganSpecific:
			'O nome também não está ligado a um órgão, e isso é deliberado. A primeira versão ia ter um nome ligado aos rins, o que teria sido um erro: as contas diárias dos imunossupressores são as mesmas qualquer que seja o órgão recebido.',
		markTitle: 'E o símbolo',
		markAlt: 'O símbolo do Graftful: um caule com um novo ramo a juntar-se-lhe de lado',
		markStrokes:
			'Dois traços: um caule que continua e um novo ramo que se lhe junta de lado. É um enxerto no sentido hortícola, o mais antigo, e é por isso que não há nele seringa, cruz nem órgão.',
		markJoinLead: 'A junção está de lado de propósito.',
		markJoinBody:
			'Um enxerto não vai para onde estava o original. Um rim transplantado é colocado à frente, no abdómen, enquanto os dois com que nasceu ficam onde estão, atrás. Uma bifurcação simétrica diria «substituído». Esta diz «unido num lugar novo», que é o que realmente aconteceu.',
		markHand:
			'Também parece uma mão a fazer um V, e isso não me incomoda. Fazer as pazes com o enxerto, e com os comprimidos que vêm com ele, é a maior parte do que viver com um acaba por ser.',
		originTitle: 'De onde veio',
		origin1:
			'Sou o Luis. Fiz um transplante de rim no CHUV, em Lausanne, a 11 de janeiro de 2016 e, como todos os que saem de um centro de transplantação, saí com um saco de caixas e sem sistema nenhum para elas.',
		origin2:
			'O que acabei por construir foi uma folha de cálculo. Tinha cada produto, quantos comprimidos por dia dava, quantos restavam na caixa e a coluna que realmente importava: quantos dias isso era. Quando algum número baixava, escrevia à farmácia. Mantive-a à mão durante anos e funcionava, mas só funcionava porque por acaso gosto de folhas de cálculo. Parecia-me absurdo exigir isso a alguém três semanas depois de um transplante.',
		origin3:
			'O Graftful é essa folha de cálculo, reconstruída para que mais ninguém tenha de a inventar. As contas nele são as que eu fazia à mão, e as partes incómodas do exemplo estão lá porque estavam no meu: uma dose feita de três dosagens diferentes, meio comprimido, uma dose em desmame e uma dosagem descontinuada a meio do tratamento.',
		originNote:
			'O esquema de exemplo na aplicação usa nomes de medicamentos inventados. Os números são reais, os produtos não: o que cada pessoa toma não é assunto de mais ninguém, incluindo meu. Este não é um produto hospitalar e não está associado a nenhum centro de transplantação.',
		madeByTitle: 'Quem o fez',
		madeByBefore: 'Feito com cuidado pelo Luis e pelo',
		madeByAfter:
			': uma pessoa transplantada e um assistente de IA, partindo de cinco anos de folha de cálculo para construir apenas as partes que se revelaram importar.',
		madeByNote:
			'Cada limite clínico acima foi uma decisão deliberada e não uma funcionalidade em falta, e as contas são verificadas contra encomendas reais de farmácia e não contra si mesmas.',
		licenceTitle: 'Código e licença',
		licenceBefore: 'O Graftful é',
		licenceLink: 'software livre no GitHub',
		licenceAfter:
			', sob a AGPL-3.0. Isso importa por uma razão prática e não ideológica: há pessoas que dependem disto todos os dias para medicação que não podem falhar, e se eu deixar de o manter ninguém deve ficar sem nada. A licença também impede que alguém o feche.',
		licenceName: 'O nome está reservado, por isso uma versão derivada tem de ter outro nome.',
		version: (version) => `Versão ${version}`
	},
	privacy: {
		title: 'Privacidade',
		metaDescription: 'O que o Graftful guarda, onde o guarda, e como confirmar.',
		headline: 'Os seus dados de medicação nunca saem do seu dispositivo.',
		headlineBody:
			'Não há conta, não há sessão e não há servidor a guardar o seu esquema. Tudo o que introduz (produtos, doses, contagens de stock, encomendas, a sua data de transplante) é guardado pelo navegador no dispositivo que está a usar, e em nenhum outro lugar.',
		checkTitle: 'Como confirmar, em vez de acreditar na minha palavra',
		checkBody:
			'Abra as ferramentas de desenvolvimento do navegador, vá ao separador Rede e use a aplicação: acrescente um produto, registe uma contagem de stock, gere uma encomenda. Nada será enviado. Isto vale mais do que qualquer política de privacidade, porque está a observar o comportamento real em vez de ler uma afirmação sobre ele.',
		collectedTitle: 'Não é recolhido nada',
		collected:
			'Sem estatísticas, sem contador de visitas e sem qualquer script de terceiros. A aplicação carrega apenas ficheiros que serve ela própria, pelo que, depois da primeira visita, não precisa da rede. Uma versão anterior contava as visitas às páginas através do Cloudflare; isso foi removido e nada o substituiu.',
		practiceTitle: 'O que isto significa na prática',
		clearingLead: 'Apagar os dados do navegador apaga o seu esquema.',
		clearingBody:
			'Este é o verdadeiro risco de guardar tudo localmente, e é por isso que a aplicação tem um botão de exportação. Use-o.',
		devicesLead: 'Os seus dados não o acompanham entre dispositivos.',
		devicesBody:
			'O telefone e o computador guardam cópias separadas. Exporte de um e importe no outro.',
		unlockLead: 'Quem conseguir desbloquear o seu dispositivo consegue lê-los.',
		unlockBody:
			'Não existe um código próprio da aplicação. O bloqueio do dispositivo é a protecção.',
		noBackupLead: 'Nada é guardado por si em cópia de segurança.',
		noBackupBody: 'Não consigo recuperar os seus dados, porque nunca os tive.',
		deletingTitle: 'Apagar tudo',
		deletingBody:
			'A configuração tem um botão que apaga tudo imediatamente. Não há nada a pedir nem conta a encerrar.',
		deletingNoCopy:
			'Como não guardo dados pessoais, não há cópia a pedir nem nada que eu possa apagar à distância. É intencional: a forma mais segura de lidar com dados de saúde sensíveis é não os receber.',
		deletingContact: 'Perguntas sobre este modelo de privacidade podem ser enviadas para'
	},
	roadmap: {
		title: 'Planos',
		metaDescription: 'O que está a ser feito a seguir, e o que nunca será construído.',
		noDates:
			'Sem datas. Isto é construído por uma pessoa ao fim do dia, e uma data seria um palpite disfarçado de promessa. A ordem abaixo é mais ou menos a ordem do trabalho.',
		workingTitle: 'O que já funciona',
		working: [
			'O seu esquema, com doses de vários comprimidos, meios comprimidos e medicação em SOS',
			'Dias de cobertura por produto, a partir do que realmente conta para a caixa',
			'Avisos de encomenda e um texto de encomenda que pode copiar ou enviar por e-mail',
			'Alterações de dose que mantêm o seu historial em vez de o substituírem',
			'Avisos de calendário que exporta uma vez e importa no telefone',
			'Cópia de segurança e restauro como ficheiro que é seu',
			'Funciona sem ligação e, depois de carregada, não faz qualquer pedido de rede'
		],
		remindersTitle: 'A seguir: avisos a sério',
		reminders1:
			'A exportação de calendário funciona e não precisa de servidor, mas tem uma falha real: altere uma dose e o calendário fica silenciosamente errado até exportar de novo.',
		reminders2:
			'As notificações push resolvem isso e trazem o que um calendário não consegue: um botão «Tomado» na própria notificação, para que registar uma toma não obrigue a abrir a aplicação. É também a única forma honesta de acompanhar a adesão: pedir a alguém que abra uma aplicação para confirmar que tomou um comprimido mede sobretudo quem se lembra de abrir aplicações.',
		reminders3:
			'Será construído de forma a que o servidor não aprenda nada. A notificação não leva conteúdo: o servidor sabe apenas quando avisar o seu dispositivo, e o texto é montado no telefone a partir de dados que nunca saíram dele.',
		consultationsTitle: 'A seguir: as suas consultas',
		consultations1:
			'Uma data e uma hora para a próxima consulta, com uma contagem decrescente ao lado do contador de dias que já vê, e um aviso na mesma exportação de calendário das suas tomas.',
		consultations2:
			'Porque é que isto merece ser uma funcionalidade a sério e não uma nota num canto: as consultas não param. As minhas continuam a ser mais ou menos a cada três meses, mais de dez anos depois. O software escrito para pessoas transplantadas tende a assumir um primeiro ano intenso e depois nada, o que não corresponde à realidade. As consultas, as análises e os comprimidos continuam indefinidamente.',
		consultations3:
			'Também deve mudar a forma de encomendar. O que realmente quer é medicação que dure até à próxima consulta, e não sessenta dias arbitrários. Quando o Graftful souber essa data, pode usá-la como horizonte em vez de um número que teve de inventar.',
		consultations4:
			'Registar uma data é uma entrada de diário, por isso isto fica bem longe do limite descrito abaixo. O Graftful não vai sugerir quando uma consulta deve ser, nem tirar conclusões do intervalo entre as suas.',
		blogTitle: 'Depois: um blogue',
		blog1:
			'Um lugar para escrever as coisas como devem ser. O primeiro artigo já está decidido: um guia passo a passo para usar o Graftful — configurar os produtos, introduzir uma dose feita de vários comprimidos, contar o stock e tirar a primeira encomenda para a farmácia.',
		blog2:
			'A aplicação tenta explicar-se, mas parte disto é genuinamente delicado à primeira vez, e uma imagem faz num relance o que um parágrafo de ajuda faz mal. Também daria às equipas de coordenação de transplantação algo para mostrar que não é uma página de início de sessão.',
		blog3:
			'Artigos prováveis depois disso: em que consistem realmente as contas e porque é que a aplicação nunca escolhe uma dose; como funcionam os avisos sem servidor; e o que dez anos a tomar os mesmos comprimidos duas vezes por dia ensinam sobre as partes que é fácil errar.',
		thenTitle: 'Depois',
		missedLead: 'Tomas falhadas.',
		missedBody:
			'Registar que uma toma foi falhada e a que hora era devida. Não o que fazer quanto a isso. Ver abaixo.',
		languagesLead: 'Mais idiomas.',
		languagesBody:
			'Inglês, francês, alemão e português cobrem toda a aplicação, a encomenda para a farmácia e o ficheiro de calendário. O italiano vem a seguir, para o Ticino. As traduções são bem-vindas e vão mais longe do que dinheiro.',
		expiryLead: 'Prazos de validade e números de lote.',
		expiryBody: 'Útil quando uma caixa está num armário há um ano, e quando há uma recolha.',
		resultsLead: 'Um lugar para os seus resultados.',
		resultsBody:
			'Um lugar para escrever um resultado de análise e guardá-lo, como um diário, sem qualquer interpretação associada.',
		travelLead: 'Viagens.',
		travelBody:
			'Calcular quanto levar para uma viagem, e o que uma mudança de fuso horário faz a um intervalo de doze horas entre tomas.',
		consideringTitle: 'Em consideração',
		surveyLead: 'Um inquérito anónimo.',
		surveyBody:
			'Saber se isto é útil e o que falta. Um inquérito a que escolhe responder, e não estatísticas recolhidas discretamente em segundo plano, o que contradiria tudo o que está na página de privacidade.',
		carerLead: 'Partilhar com quem cuida de si.',
		carerBody:
			'Genuinamente difícil sem um servidor que guarde os seus dados, que é precisamente a única coisa que esta aplicação não faz. Ainda sem boa resposta.',
		neverTitle: 'Nunca',
		neverIntro:
			'Isto não está numa lista de espera. É o limite entre uma ferramenta de acompanhamento e um dispositivo médico regulado, e são também decisões de quem lhe prescreve.',
		never: [
			'Calcular uma dose a partir de um nível sanguíneo, do seu peso ou de qualquer análise',
			'Decidir que comprimidos compõem uma dose que lhe foi prescrita',
			'Dizer-lhe o que fazer quando falha uma toma',
			'Avisos de interações',
			'Julgar uma análise: sem limiares, sem setas de tendência, sem números vermelhos'
		],
		neverMoreLink: 'Mais sobre as razões',
		neverMoreAfter: ', incluindo a formulação exacta daquilo para que esta aplicação serve.',
		missingTitle: 'Falta alguma coisa?',
		missing1:
			'O mais útil que me pode enviar é aquilo que o irritou, ou o caso do seu esquema que esta aplicação trata mal. Nenhum esquema é típico, e o meu é só um deles.',
		suggestLink: 'Sugira no GitHub',
		missingOrEmail: 'ou escreva para',
		missingBugBefore: 'Se algo está avariado em vez de em falta,',
		bugLink: 'comunique um erro',
		missingBugAfter: 'em vez disso.',
		missingPrivacyBefore:
			'Os tópicos no GitHub são públicos, por isso deixe de fora nomes de medicamentos, doses, datas de transplante e tudo o mais do seu próprio esquema; use o e-mail se não conseguir descrever sem isso. Há outras formas de ajudar em',
		supportLink: 'a página de apoio',
		missingPrivacyAfter: ', incluindo corrigir uma tradução.'
	},
	support: {
		title: 'Apoiar',
		metaDescription:
			'O Graftful é gratuito. O mais útil que pode fazer é falar dele a quem precisa.',
		free1:
			'O Graftful é gratuito e vai continuar a ser. Não há nível pago, nada está bloqueado e nenhuma funcionalidade depende de dinheiro.',
		free2:
			'Também custa quase nada a manter: um domínio e alojamento que é gratuito nesta dimensão. O que realmente falta é que as pessoas saibam que existe. Se o achou útil, falar dele a uma pessoa vale mais do que um donativo.',
		tellTitle: 'Fale dele a quem precisa',
		recipientLead: 'A outra pessoa transplantada.',
		recipientBody:
			'A quem está nos primeiros meses depois de um transplante, afogado em caixas. É o momento em que isto ajuda mais, e o momento em que ninguém tem energia para ir procurar uma ferramenta.',
		coordinatorLead: 'À sua equipa de coordenação de transplantação.',
		coordinatorBody:
			'São essas as pessoas que realmente têm a conversa sobre adesão, e normalmente ficam contentes por ter algo concreto para mostrar. Não a recepção.',
		pharmacistLead: 'Ao seu médico de família ou farmacêutico.',
		pharmacistBody:
			'O seu farmacêutico em particular vê todas as semanas as consequências de encomendas mal calculadas.',
		associationLead: 'A uma associação de doentes ou a um grupo online.',
		associationBody: 'Uma publicação chega a mais pessoas do que eu jamais chegarei sozinho.',
		tellNote:
			'Nada para criar e nada para instalar. Partilhar o endereço é suficiente. Funciona primeiro num navegador e instala-se no ecrã inicial se quiser.',
		wrongTitle: 'Diga-me o que está mal',
		wrong1:
			'Aquilo que o confundiu, ou que teve de contornar. A confusão é um defeito, não um erro do utilizador.',
		wrong2:
			'O caso do seu esquema que o Graftful trata mal. Não há dois esquemas iguais, e o meu é só um deles.',
		wrong3:
			'Tudo o que lhe pareceu clinicamente errado. Isso importa mais do que qualquer outro tipo de relato.',
		bugLink: 'Comunicar um erro no GitHub',
		wrongOrEmail: 'ou escreva para',
		wrongNote: (version) =>
			`Ambos já levam a versão que está a usar (${version}), por isso não há nada a procurar. Os tópicos no GitHub são públicos: por favor não inclua nomes de medicamentos, doses, datas de transplante, imagens do seu esquema nem uma cópia de segurança exportada. Use o e-mail se o problema não puder ser descrito sem informação de saúde pessoal. O Graftful não pode aconselhar sobre uma toma falhada nem sobre qualquer decisão de medicação; contacte a sua equipa de transplantação para isso.`,
		ideasTitle: 'Ideias e outros contactos',
		ideasBefore: 'Para uma ideia ou comentário sobre o produto, use o',
		ideaLink: 'formulário de ideias no GitHub',
		ideasOrEmail: 'ou escreva para',
		contactBefore: 'Para questões gerais, parcerias ou imprensa:',
		contactAfter:
			'. O correio para os endereços +bugs e +ideas chega à mesma caixa e é aí separado; não é copiado automaticamente para um tópico público no GitHub. Os relatos de segurança vão para',
		securityAfter:
			'em vez disso, para que uma vulnerabilidade não se torne pública antes de ser corrigida.',
		translationTitle: 'Corrigir uma tradução',
		translationState:
			'Toda a aplicação está disponível em inglês, francês, alemão e português, incluindo a encomenda para a farmácia e o ficheiro de calendário. O alemão ainda não foi lido por uma pessoa de língua materna.',
		translationBefore:
			'Se uma palavra soar errada, estranha ou demasiado formal no seu idioma, vale a pena dizê-lo. Envie como',
		translationBugLink: 'erro',
		translationMiddle:
			', que não precisa de conta no GitHub, ou, se estiver à vontade com código, edite o catálogo directamente:',
		translationFilesLink: 'um ficheiro por idioma',
		translationAfter: 'em',
		translationWhy:
			'Uma palavra errada numa aplicação de medicação não é cosmética. Quem está a decidir se confia nisto com a sua receita lê o tom antes de ler as funcionalidades, e uma tradução chega a um país inteiro. Vai bastante mais longe do que dinheiro.',
		moneyTitle: 'Se ainda assim preferir enviar algo',
		moneyNote: 'Genuinamente opcional. Gerir um transplante já é caro o suficiente.',
		twintAlt: 'Código QR TWINT'
	},
	notFound: {
		title: 'Página não encontrada',
		body404:
			'Não existe página neste endereço. O link pode estar mal escrito, ou pode apontar para algo que esta versão do Graftful não tem.',
		bodyOther: 'Algo falhou ao carregar esta página.',
		dataSafe:
			'Nada do que introduziu é afectado. O seu esquema, as contagens de stock e o historial são guardados pelo navegador neste dispositivo, e um link errado não lhes toca.',
		goToToday: 'Ir para Hoje'
	}
};
