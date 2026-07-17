// A read-only on/off pill used for the profile's preference flags.
export default function Toggle({ on }) {
  return <span className={`toggle ${on ? 'toggle-on' : ''}`}>{on ? 'On' : 'Off'}</span>
}
