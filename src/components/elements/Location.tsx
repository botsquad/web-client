import React, { useState } from 'react'
import { GoogleMap, Marker, LoadScript } from '@react-google-maps/api'
import { MyLocation } from '../icons'
import Message, { Location as LocationType } from './types'
import { ChatHandler } from 'components'
function transformLngLon(position: LocationType) {
  return position ? { lat: position.lat, lng: position.lon } : null
}

interface MapProps {
  message: Message<LocationType>
  handler: ChatHandler | null
}

const Map: React.FC<MapProps> = ({ message, handler }) => {
  const [address, setAddress] = useState<string | null>(null)
  if (!handler) {
    return null
  }
  const click = () => {
    const { payload } = message
    const url = `http://maps.google.com/?q=${payload.lat},${payload.lon}`
    window.open(url, '_blank')
    if (handler) handler.sendLinkClick(url)
  }
  // useEffect(() => {
  //   const geocoder = new window.google.maps.Geocoder()
  //   const latlng = transformLngLon(message.payload)
  //   geocoder.geocode({ location: latlng }, results => {
  //     if (results && results[0]) {
  //       const address = results[0].formatted_address
  //       setAddress(address)
  //     }
  //   })
  // }, [])

  const { payload } = message
  const center = transformLngLon(payload)
  if (!center) {
    return null
  }
  return (
    <div>
      <LoadScript googleMapsApiKey={handler.getMapsAPIKey()}>
        <GoogleMap
          onLoad={map => {
            const bounds = new window.google.maps.LatLngBounds()
            map.fitBounds(bounds)
            const geocoder = new window.google.maps.Geocoder()

            const latlng = transformLngLon(message.payload)
            geocoder.geocode({ location: latlng }, results => {
              if (results && results[0]) {
                const address = results[0].formatted_address
                setAddress(address)
              }
            })
          }}
          zoom={14}
          center={center}
          onClick={click}
          options={{
            disableDefaultUI: true,
            zoomControl: true,
            clickableIcons: false,
            mapTypeId: 'roadmap',
          }}
        >
          <Marker position={center} onClick={click} />
        </GoogleMap>
      </LoadScript>
      <div className="address">{address}</div>
    </div>
  )
}

interface StaticLocationProps {
  className: string
  handler: ChatHandler | null
  message: Message<LocationType>
}

const StaticLocation: React.FC<StaticLocationProps> = ({ className, message, handler }) => {
  const { payload } = message
  if (!payload || !payload.lat || !handler) {
    return null
  }

  const mapsApiKey = handler.getMapsAPIKey()
  const { lon, lat } = payload
  const maptype = payload.maptype || 'roadmap'
  const zoom = payload.zoom || 14
  const url = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lon}&zoom=${zoom}&scale=2&size=150x150&maptype=${maptype}&format=png&visual_refresh=true&markers=size:mid%7Ccolor:0xff0000%7Clabel:%7C${lat},${lon}&key=${mapsApiKey}`

  return (
    <div className={className} onClick={() => handler.component.showModal(message)}>
      {mapsApiKey ? <img src={url} alt="Location" /> : MyLocation}
    </div>
  )
}

interface LocationProps {
  message: Message<LocationType>
  toggleModalPreferHeight: ((condition: boolean) => void) | null
  handler: ChatHandler | null
  className: any
}

const Location: React.FC<LocationProps> = props => {
  const { message, toggleModalPreferHeight } = props
  const { payload } = message
  if (!payload || !payload.lat) {
    return null
  }

  if (toggleModalPreferHeight) {
    return <Map {...props} />
  }

  return <StaticLocation {...props} />
}

export default Location
