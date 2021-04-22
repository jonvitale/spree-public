import QdtComponents from 'qdt-components'

const host = 'dashboards.philasd.org' // window.location.hostname

const isTesting = true
const appId = isTesting
  ? '49b5fae0-46c6-41bc-be50-393f94a69ede'
  : '517d242a-5660-48c1-9af7-c27a0fc073ac'

const config = {
  host,
  prefix: '',
  port: host === 'localhost' ? 4848 : 443, // window.location.port,
  secure: host === 'localhost' ? window.location.protocol === 'https:' : true,
  appId,
}
const connections = {
  vizApi: true,
  engineApi: true,
}
const qdtComponents = new QdtComponents(config, connections)

console.log('opening port', config.port)

export default ({ app }, inject) => {
  inject('qdt', qdtComponents)
}
