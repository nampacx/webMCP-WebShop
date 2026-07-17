// Renders a postal address as an <address> block. Shared by the profile page
// and the order confirmation page.
export default function AddressBlock({ address, className = '' }) {
  return (
    <address className={className}>
      {address.name}
      <br />
      {address.address}
      <br />
      {address.city}, {address.zip}
      <br />
      {address.country}
    </address>
  )
}
