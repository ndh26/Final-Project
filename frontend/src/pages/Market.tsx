import { Link } from 'react-router-dom'
import AskAssistant from '../components/AskAssistant'
import Flourish from '../components/Flourish'
import { MARKET, formatMarketDate, isToday, mapLink, nextMarketDay } from '../market'

export default function Market() {
  const nextMarket = nextMarketDay()

  return (
    <section className="section market-page">
      <div className="section-title">
        <h1>Goliad Market Days</h1>
        <Flourish />
      </div>
      <p className="lead center-text">
        Come say hi and pick up a jar in person. What we bring depends on the harvest, so if you’re coming
        for something specific, <Link to="/contact">send a message</Link> first.
      </p>

      <div className="market-feature">
        <p className="market-when">2nd Saturday every month</p>
        <p>
          On the historic Courthouse Square in downtown Goliad, Texas.{' '}
          <a href={mapLink(MARKET.mapQuery)} target="_blank" rel="noreferrer">
            Map
          </a>
        </p>
        <p className="market-next">
          {isToday(nextMarket) ? (
            <strong>We’re at the market today!</strong>
          ) : (
            <>
              Next market day: <strong>{formatMarketDate(nextMarket)}</strong>
            </>
          )}
        </p>
      </div>

      <p className="center-text">
        <Link to="/contact" className="btn btn-primary">
          Contact Me
        </Link>
      </p>

      <AskAssistant />
    </section>
  )
}
