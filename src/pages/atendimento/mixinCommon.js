import { format, parseISO, parseJSON } from 'date-fns'
import pt from 'date-fns/locale/pt-BR'
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters(['mensagensTicket', 'ticketFocado', 'hasMore'])
  },
  data () {
    return {
      loading: false
    }
  },
  methods: {
    scrollToBottom () {
      setTimeout(() => {
        this.$root.$emit('scrollToBottomMessageChat')
      }, 200)
    },
    dataInWords (date) {
      return format(parseJSON(date), 'HH:mm', { locale: pt })
    },
    formatarMensagemWhatsapp (body) {
      if (!body) return
      let format = body
      // Escape HTML tags
      format = format.replace(/</g, "&lt;").replace(/>/g, "&gt;");
      function is_aplhanumeric (c) {
        var x = c.charCodeAt()
        return !!(((x >= 65 && x <= 90) || (x >= 97 && x <= 122) || (x >= 48 && x <= 57)))
      }
      function whatsappStyles (format, wildcard, opTag, clTag) {
        var indices = []
        for (var i = 0; i < format.length; i++) {
          if (format[i] === wildcard) {
            // eslint-disable-next-line no-unused-expressions
            if (indices.length % 2) { (format[i - 1] == ' ') ? null : ((typeof (format[i + 1]) == 'undefined') ? indices.push(i) : (is_aplhanumeric(format[i + 1]) ? null : indices.push(i))) } else { (typeof (format[i + 1]) == 'undefined') ? null : ((format[i + 1] == ' ') ? null : (typeof (format[i - 1]) == 'undefined') ? indices.push(i) : ((is_aplhanumeric(format[i - 1])) ? null : indices.push(i))) }
          } else {
            // eslint-disable-next-line no-unused-expressions
            (format[i].charCodeAt() == 10 && indices.length % 2) ? indices.pop() : null
          }
        }
        // eslint-disable-next-line no-unused-expressions
        (indices.length % 2) ? indices.pop() : null
        var e = 0
        indices.forEach(function (v, i) {
          var t = (i % 2) ? clTag : opTag
          v += e
          format = format.substr(0, v) + t + format.substr(v + 1)
          e += (t.length - 1)
        })
        return format
      }
      format = whatsappStyles(format, '_', '<i>', '</i>')
      format = whatsappStyles(format, '*', '<b>', '</b>')
      format = whatsappStyles(format, '~', '<s>', '</s>')
      format = format.replace(/\n/gi, '<br>')
      return format
    },
    formatarMensagemRespostaBotaoWhatsapp(body) {
      if (!body) return
      let format = body
    
      function is_alphanumeric(c) {
        var x = c.charCodeAt()
        return !!(((x >= 65 && x <= 90) || (x >= 97 && x <= 122) || (x >= 48 && x <= 57)))
      }
    
      function whatsappStyles(format, wildcard, opTag, clTag) {
        var indices = []
        try {
          for (var i = 0; i < format.length; i++) {
            if (format[i] === wildcard) {
              if (indices.length % 2) {
                (format[i - 1] == ' ') ? null : ((typeof (format[i + 1]) == 'undefined') ? indices.push(i) : (is_alphanumeric(format[i + 1]) ? null : indices.push(i)))
              } else {
                (typeof (format[i + 1]) == 'undefined') ? null : ((format[i + 1] == ' ') ? null : (typeof (format[i - 1]) == 'undefined') ? indices.push(i) : ((is_alphanumeric(format[i - 1])) ? null : indices.push(i)))
              }
            } else {
              (format[i].charCodeAt() == 10 && indices.length % 2) ? indices.pop() : null
            }
          }
          (indices.length % 2) ? indices.pop() : null
          var e = 0
          indices.forEach(function (v, i) {
            var t = (i % 2) ? clTag : opTag
            v += e
            format = format.substr(0, v) + t + format.substr(v + 1)
            e += (t.length - 1)
          })
        } catch (error) {
          console.error('Erro ao aplicar estilos do WhatsApp:', error)
        }
        return format
      }
    
      try {
        format = whatsappStyles(format, '_', '<i>', '</i>')
        format = whatsappStyles(format, '*', '<b>', '</b>')
        format = whatsappStyles(format, '~', '<s>', '</s>')
        format = format.replace(/\n/gi, '<br>')
        return `➡️ ${format}`
      } catch (error) {
        console.error('Erro ao formatar mensagem:', error)
        return body
      }
    },
    formatarNotas(body) {
      if (!body) return;
    
      // Detectar links e transformar em âncoras HTML
      const urlRegex = /((https?:\/\/[^\s]+))/g;
      const bodyComLink = body.replace(urlRegex, '<a href="$1" target="_blank">$1</a>');
    
      return `<b>${this.$t('atendimentomixinCommon.note')} ${bodyComLink}</b> `;
    },    
    formatarTransferencia(body){
      if (!body) return
      return `<b>${this.$t('atendimentomixinCommon.transfer')} ${body} </b>`;
    },
    formatarTranscricao(body){
      if (!body) return
      return `<b>${this.$t('atendimentomixinCommon.audio')} ${body} </b>`;
    }, 
    formatarTemplates(body) {
      if (!body) return '';
      const components = JSON.parse(body);
      let headerText = '', bodyText = '', footerText = '', buttonsHtml = '';
  
      components.forEach(component => {
          if (component.type === 'HEADER') {
              if (component.format === 'TEXT') {
                  headerText = `<h2 style="font-weight: bold;">${component.text}</h2>`;
              } else if (component.format === 'VIDEO' && component.example && component.example.header_handle) {
                  headerText = `<video controls width="250">
                                  <source src="${component.example.header_handle[0]}" type="video/mp4">
                                  Your browser does not support the video tag.
                                </video>`;
              } else if (component.format === 'DOCUMENT' && component.example && component.example.header_handle) {
                  headerText = `<p><a href="${component.example.header_handle[0]}" download>Download Document</a></p>`;
              }
          } else if (component.type === 'BODY') {
              bodyText = `<p>${component.text}</p>`;
          } else if (component.type === 'FOOTER') {
              footerText = `<footer style="font-size: 0.75em; color: grey;">${component.text}</footer>`;
          } else if (component.type === 'BUTTONS') {
              component.buttons.forEach(button => {
                  let buttonText = button.text ? button.text.trim() : '';
                  if (!buttonText) return; // Se o texto do botão estiver vazio ou undefined, não renderiza
                  
                  if (button.type === 'URL') {
                      buttonsHtml += `<a href="${button.url || '#'}" style="display: inline-block; margin: 5px; padding: 10px; background-color: #0084ff; color: white; text-decoration: none; border-radius: 5px;">${buttonText}</a>`;
                  } else if (button.type === 'QUICK_REPLY') {
                      buttonsHtml += `<button style="display: inline-block; margin: 5px; padding: 10px; background-color: #0084ff; color: white; border: none; border-radius: 5px;">${buttonText}</button>`;
                  } else if (button.type.toUpperCase() === 'COPY_CODE') {
                      const codeText = button.example ? button.example[0] : ''; // Evita undefined
                      if (codeText) {
                          buttonsHtml += `<button onclick="navigator.clipboard.writeText('${codeText}')" style="display: inline-block; margin: 5px; padding: 10px; background-color: #0084ff; color: white; border: none; border-radius: 5px;">
                                          ${buttonText}
                                      </button>`;
                      }
                  }
              });
          }
      });
  
      return `${headerText}${bodyText}${footerText}${buttonsHtml}`;
    },
    formatarBotaoWhatsapp(body) {
      if (!body) return
      let format = body
    
      function is_alphanumeric(c) {
        var x = c.charCodeAt()
        return !!(((x >= 65 && x <= 90) || (x >= 97 && x <= 122) || (x >= 48 && x <= 57)))
      }
    
      function whatsappStyles(format, wildcard, opTag, clTag) {
        var indices = []
        try {
          for (var i = 0; i < format.length; i++) {
            if (format[i] === wildcard) {
              if (indices.length % 2) {
                (format[i - 1] == ' ') ? null : ((typeof (format[i + 1]) == 'undefined') ? indices.push(i) : (is_alphanumeric(format[i + 1]) ? null : indices.push(i)))
              } else {
                (typeof (format[i + 1]) == 'undefined') ? null : ((format[i + 1] == ' ') ? null : (typeof (format[i - 1]) == 'undefined') ? indices.push(i) : ((is_alphanumeric(format[i - 1])) ? null : indices.push(i)))
              }
            } else {
              (format[i].charCodeAt() == 10 && indices.length % 2) ? indices.pop() : null
            }
          }
          (indices.length % 2) ? indices.pop() : null
          var e = 0
          indices.forEach(function (v, i) {
            var t = (i % 2) ? clTag : opTag
            v += e
            format = format.substr(0, v) + t + format.substr(v + 1)
            e += (t.length - 1)
          })
        } catch (error) {
          console.error('Erro ao aplicar estilos do WhatsApp:', error)
        }
        return format
      }
    
      try {
        let [tituloDescricao, ...botoes] = body.split(', Btn');
        tituloDescricao = tituloDescricao.replace('Body: ', '').replace(':', ':\n') + '\n';
        botoes = botoes.map(btn => {
          const [numero, texto] = btn.split(':');
          return `<button button style="display: inline-block; margin: 5px; padding: 10px; background-color: #0084ff; color: white; border: none; border-radius: 5px;" title=${this.$t('atendimentomixinCommon.buttonNotAvailable')}>➡️ ${texto.trim()}</button>`;
        });
        let formatado = [tituloDescricao, ...botoes].join('\n');
        formatado = whatsappStyles(formatado, '_', '<i>', '</i>')
        formatado = whatsappStyles(formatado, '*', '<b>', '</b>')
        formatado = whatsappStyles(formatado, '~', '<s>', '</s>')
        formatado = formatado.replace(/\n/gi, '<br>')
        return formatado
      } catch (error) {
        console.error('Erro ao formatar botão do WhatsApp:', error)
        return body
      }
    },
    formatarBotao(body) {
      if (!body) return
    
      try {
        // Formatando a string recebida como um botão
        const formatado = `<button style="display: inline-block; margin: 5px; padding: 10px; background-color: #0084ff; color: white; border: none; border-radius: 5px;" title=${this.$t('atendimentomixinCommon.buttonNotAvailable')}>➡️ ${body.trim()}</button>`;
        return formatado;
      } catch (error) {
          console.error('Erro ao formatar botão do WhatsApp:', error);
          return body;
      }
    },
    formatarMensagemDeLista(body) {
      if (!body) return '';
      
      try {
        const data = JSON.parse(body);
    
        let format = body
    
        function is_alphanumeric(c) {
          var x = c.charCodeAt()
          return !!(((x >= 65 && x <= 90) || (x >= 97 && x <= 122) || (x >= 48 && x <= 57)))
        }
    
        function whatsappStyles(format, wildcard, opTag, clTag) {
          var indices = []
          try {
            for (var i = 0; i < format.length; i++) {
              if (format[i] === wildcard) {
                if (indices.length % 2) {
                  (format[i - 1] == ' ') ? null : ((typeof (format[i + 1]) == 'undefined') ? indices.push(i) : (is_alphanumeric(format[i + 1]) ? null : indices.push(i)))
                } else {
                  (typeof (format[i + 1]) == 'undefined') ? null : ((format[i + 1] == ' ') ? null : (typeof (format[i - 1]) == 'undefined') ? indices.push(i) : ((is_alphanumeric(format[i - 1])) ? null : indices.push(i)))
                }
              } else {
                (format[i].charCodeAt() == 10 && indices.length % 2) ? indices.pop() : null
              }
            }
            (indices.length % 2) ? indices.pop() : null
            var e = 0
            indices.forEach(function (v, i) {
              var t = (i % 2) ? clTag : opTag
              v += e
              format = format.substr(0, v) + t + format.substr(v + 1)
              e += (t.length - 1)
            })
          } catch (error) {
            console.error('Erro ao aplicar estilos do WhatsApp:', error)
          }
          return format
        }
    
        let header = data.header ? `<h3 style="font-weight: bold;">${data.header}</h3>` : '';
        let bodyText = data.body ? `<p>${data.body.replace(/\n/g, '<br>')}</p>` : '';
        let footer = data.footer ? `<footer style="font-size: 0.75em; color: grey;">${data.footer}</footer>` : '';
        let buttonText = data.button_text ? `<button button style="display: inline-block; margin: 5px; padding: 10px; background-color: #0084ff; color: white; border: none; border-radius: 5px;" title=${this.$t('atendimentomixinCommon.buttonNotAvailable')}>➡️ ${data.button_text}</button>` : '';
    
        header = whatsappStyles(header, '_', '<i>', '</i>');
        header = whatsappStyles(header, '*', '<b>', '</b>');
        header = whatsappStyles(header, '~', '<s>', '</s>');
    
        bodyText = whatsappStyles(bodyText, '_', '<i>', '</i>');
        bodyText = whatsappStyles(bodyText, '*', '<b>', '</b>');
        bodyText = whatsappStyles(bodyText, '~', '<s>', '</s>');
    
        footer = whatsappStyles(footer, '_', '<i>', '</i>');
        footer = whatsappStyles(footer, '*', '<b>', '</b>');
        footer = whatsappStyles(footer, '~', '<s>', '</s>');
    
        buttonText = whatsappStyles(buttonText, '_', '<i>', '</i>');
        buttonText = whatsappStyles(buttonText, '*', '<b>', '</b>');
        buttonText = whatsappStyles(buttonText, '~', '<s>', '</s>');
    
        let sectionsHtml = '';
        if (data.sections && data.sections.length > 0) {
          data.sections.forEach(section => {
            if (section.rows && section.rows.length > 0) {
              sectionsHtml += '<ul>';
              section.rows.forEach(row => {
                sectionsHtml += `<li><strong>${row.title}</strong>: ${row.description}</li>`;
              });
              sectionsHtml += '</ul>';
            }
          });
        }
    
        return `${header}${bodyText}${buttonText}${sectionsHtml}${footer}`;
      } catch (error) {
        console.error('Erro ao formatar mensagem de lista:', error)
        return body
      }
    }, 
    formatarTemplateBaileys(body) {
      if (!body) return '';
    
      let headerText = '', bodyText = '', footerText = '', buttonsHtml = '';
    
      const lines = body.split('\n');
    
      lines.forEach(line => {
        line = line.trim();
    
        // Título entre asteriscos
        if (line.startsWith('*') && line.endsWith('*') && line.length > 2) {
          headerText = `<h2 style="font-weight: bold;">${line.replace(/\*/g, '')}</h2>`;
          return;
        }
    
        // Rodapé entre underlines
        if (line.startsWith('_') && line.endsWith('_') && line.length > 2) {
          footerText = `<footer style="font-size: 0.75em; color: grey;">${line.replace(/_/g, '')}</footer>`;
          return;
        }
    
        // Botões rápidos
        if (line.includes('[QuickReply]')) {
          const match = line.match(/\[QuickReply\] (.+?) \(id: (.+?)\)/);
          if (match) {
            const label = match[1].trim();
            buttonsHtml += `<button style="display: inline-block; margin: 5px; padding: 10px; background-color: #0084ff; color: white; border: none; border-radius: 5px;">${label}</button>`;
          }
          return;
        }
    
        // Botões de link
        if (line.includes('[Link]')) {
          const match = line.match(/\[Link\] (.+?) -> (.+)/);
          if (match) {
            const text = match[1].trim();
            const url = match[2].trim();
            buttonsHtml += `<a href="${url}" target="_blank" style="display: inline-block; margin: 5px; padding: 10px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px;">${text}</a>`;
          }
          return;
        }
    
        // Botões de ligação
        if (line.includes('[Ligar]')) {
          const match = line.match(/\[Ligar\] (.+?) -> (.+)/);
          if (match) {
            const text = match[1].trim();
            const phone = match[2].trim();
            buttonsHtml += `<a href="tel:${phone}" style="display: inline-block; margin: 5px; padding: 10px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 5px;">📞 ${text}</a>`;
          }
          return;
        }
    
        // Ignorar linha [Botões] (apenas título visual)
        if (line.includes('[Botões]')) return;
    
        // Conteúdo comum
        if (line.trim() !== '') {
          bodyText += `<p>${line}</p>`;
        }
      });
    
      return `${headerText}${bodyText}${footerText}${buttonsHtml}`;
    },    
    formatarData (data, formato = 'dd/MM/yyyy') {
      if (!data) return 'dd/MM/yyyy'
      return format(parseISO(data), formato, { locale: pt })
    }
  }
}
