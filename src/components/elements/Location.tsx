import React, { ReactNode, useEffect, useState } from 'react'
import { compose, mapProps, withProps } from 'recompose'
import { withScriptjs, withGoogleMap, GoogleMap, Marker } from 'react-google-maps'
import { MyLocation } from '../icons'
import Message, { Location as LocationType } from './types'
function transformLngLon(position: LocationType) {
  return position ? { lat: position.lat, lng: position.lon } : null
}

interface MapProps {
  message: Message<LocationType>
  handler: any
}

const Map: React.FC<MapProps> = ({ message, handler }) => {
  const [address, setAddress] = useState<string | null>(null)

  const click = () => {
    const { payload } = message
    const url = `http://maps.google.com/?q=${payload.lat},${payload.lon}`
    window.open(url, '_blank')
    handler.sendLinkClick(url)
  }
  useEffect(() => {
    const geocoder = new google.maps.Geocoder()
    const latlng = transformLngLon(message.payload)
    geocoder.geocode({ location: latlng }, results => {
      if (results && results[0]) {
        const address = results[0].formatted_address
        setAddress(address)
      }
    })
  }, [])

  const { payload } = message
  const center = transformLngLon(payload)

  return (
    <div>
      <GoogleMap
        defaultZoom={14}
        defaultCenter={center}
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
      <div className="address">{address}</div>
    </div>
  )
}

const ComposedMap = compose<MapProps, { children?: ReactNode }>(
  withProps((r: MapProps) => {
    const { clientHeight } = r.handler.getClientDimensions()
    const height = Math.floor(clientHeight * 0.6) + 'px'
    const mapsApiKey = r.handler.getMapsAPIKey()

    return {
      googleMapURL: `https://maps.googleapis.com/maps/api/js?v=3.exp&key=${mapsApiKey}&libraries=geometry,drawing,places`,
      loadingElement: <div style={{ height, width: '100%' }} />,
      containerElement: <div style={{ height: '100%', width: '100%' }} />,
      mapElement: <div style={{ height, width: '100%' }} />,
    }
  }),
  withScriptjs,
  withGoogleMap,
)(Map)

interface StaticLocationProps {
  className: string
  handler: any
  message: Message<LocationType>
}

const StaticLocation: React.FC<StaticLocationProps> = ({ className, message, handler }) => {
  const { payload } = message
  if (!payload || !payload.lat) {
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
  modal: any
  handler: any
  className: any
}

const Location: React.FC<LocationProps> = props => {
  const { message, modal } = props
  const { payload } = message
  if (!payload || !payload.lat) {
    return null
  }

  if (modal) {
    return <ComposedMap {...props} />
  }

  return <StaticLocation {...props} />
}

export default Location
