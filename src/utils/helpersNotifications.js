import { Notify } from 'quasar'
import Errors from 'src/utils/errors'

export const notificarErro = (msg, error = null) => {

  let erro = 'Exceção não identificada';

  if (error && typeof error === 'object') {
    erro = error?.data?.error || 
           error?.data?.msg || 
           error?.data?.message || 
           error?.response?.data?.error || 
           'Não identificado';
  }
  let message = '';

  console.log(error)
  if (error) {
    message = `
      <p class="text-bold">
        ${'Exceção capturada: consulte o log do Chrome para mais detalhes.'}
      </p>
    `;
  } else {
    message = `
      <p class="text-bold">
        <span class="text-bold">${erro}</span>
      </p>
    `;
  }

  Notify.create({
    type: 'positive',
    progress: true,
    position: 'top',
    timeout: 1500,
    message,
    actions: [{
      icon: 'close',
      round: true,
      color: 'white'
    }],
    html: true
  })
  // throw new Error(message)
}

export const notificarSucesso = (msg) => {
  const message = `Tudo certo... <br>${msg}.`
  Notify.create({
    type: 'positive',
    progress: true,
    position: 'top',
    message,
    timeout: 500,
    actions: [{
      icon: 'close',
      round: true,
      color: 'white'
    }],
    html: true
  })
}
