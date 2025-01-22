import { ProxyCreated } from '../../generated/TicketFactory/Factory'
import { Ticket as TicketTemplate } from '../../generated/templates'
import { Ticket as Ticket } from '../../generated/templates/Ticket/Ticket'
import { Pool as Pool } from '../../generated/templates/Ticket/Pool'
import { PoolTogetherTicket } from '../../generated/schema'

export function handleProxyCreated(event: ProxyCreated): void {
  let ticket = PoolTogetherTicket.load(event.params.proxy.toHexString())
  if (!ticket) {
    const ticketContract = Ticket.bind(event.params.proxy)
    const poolAddress = ticketContract.controller()

    const poolContract = Pool.bind(poolAddress)
    const token = poolContract.token()

    ticket = new PoolTogetherTicket(event.params.proxy.toHexString())
    ticket.ticket = event.params.proxy
    ticket.token = token
    ticket.pool = poolAddress
    ticket.save()
  }

  // create the tracked contract based on the template
  TicketTemplate.create(event.params.proxy)
}
