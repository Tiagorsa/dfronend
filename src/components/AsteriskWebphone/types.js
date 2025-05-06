/**
 * @typedef {Object} Call
 * @property {number} id - ID da chamada
 * @property {string} number - Número da chamada
 * @property {number} duration - Duração da chamada em segundos
 * @property {'answered'|'missed'|'outgoing'} status - Status da chamada
 * @property {number} time - Timestamp da chamada
 */

/**
 * @typedef {Object} ActiveCall
 * @property {string} number - Número da chamada ativa
 * @property {number} duration - Duração da chamada ativa em segundos
 */

/**
 * @typedef {Object} ExtensionStatus
 * @property {string} extension - Número do ramal
 * @property {'online'|'offline'|'busy'|'ringing'|'in-call'} status - Status do ramal
 * @property {Call} [lastCall] - Última chamada do ramal
 */

/**
 * @typedef {Object} AsteriskConfig
 * @property {string} host - Host do servidor Asterisk
 * @property {number} port - Porta do servidor Asterisk
 * @property {string} login - Login de acesso
 * @property {string} password - Senha de acesso
 */

/**
 * @typedef {Object} CallOptions
 * @property {string} from - Número de origem
 * @property {string} to - Número de destino
 * @property {number} [timeout] - Timeout da chamada em segundos
 */

/**
 * @typedef {Object} AsteriskEvent
 * @property {string} event - Nome do evento
 * @property {*} [key] - Propriedades adicionais do evento
 */ 