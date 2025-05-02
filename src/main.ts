import { mount } from 'svelte'
import App from './App.svelte'
import './styles/global.css'
import './lib/i18n' // Import i18n configuration

const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app
