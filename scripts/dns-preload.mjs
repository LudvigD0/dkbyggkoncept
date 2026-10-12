// Optional resolver override for CLI verification when the local DNS blocks MongoDB SRV queries.
import { setServers } from 'node:dns/promises'
if (process.env.MIGRATION_DNS_SERVERS) setServers(process.env.MIGRATION_DNS_SERVERS.split(','))
