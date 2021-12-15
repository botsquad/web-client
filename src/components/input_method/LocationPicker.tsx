import React, { useEffect, useState } from 'react'
import { GoogleMap, Marker, LoadScript } from '@react-google-maps/api'

import { chatLabel } from '../../common/labels'
import { MyLocation } from '../icons'
import InputMethodContainer from './InputMethodContainer'
import { Location as LocationType } from '../elements/types'
import { useInputMethodProps } from './InputMethodContext'
import { ChatHandler } from 'components'

function transformLngLon(position: LocationType) {
  return position ? { lat: position.lat, lng: position.lon } : null
}

interface MapProps {
  center: LocationType | null
  position: LocationType | null
  config: { zoom?: number }
  onChange: ([string]: any) => void
  handler: ChatHandler | null
}

const Map: React.FC<MapProps> = props => {
  const [map, setMap] = useState<GoogleMap | null>()

  const setMarkerPosition = ({ latLng }) => {
    if (map) {
      const center = { lat: latLng.lat(), lon: latLng.lng() }
      const position = { lat: latLng.lat(), lon: latLng.lng() }
      props.onChange({ position, center })
    }
  }

  const { config, position } = props
  if (!position || !props.center || !props.handler) {
    return null
  }
  const googleMapsPosition = transformLngLon(position)
  const center = transformLngLon(props.center)

  return (
    <LoadScript googleMapsApiKey={props.handler.getMapsAPIKey()}>
      <GoogleMap
        onLoad={map => {
          const bounds = new window.google.maps.LatLngBounds()
          map.fitBounds(bounds)
        }}
        center={center ? center : undefined}
        zoom={config.zoom}
        onClick={setMarkerPosition}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
          fullscreenControl: true,
          clickableIcons: false,
          mapTypeId: 'roadmap',
        }}
      >
        {googleMapsPosition ? <Marker position={googleMapsPosition} draggable onDragEnd={setMarkerPosition} /> : null}
      </GoogleMap>
    </LoadScript>
  )
}

interface LocationPickerProps {
  settings: Record<string, any>
}

const LocationPicker: React.FC<LocationPickerProps> = ({ settings }) => {
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [position, setPosition] = useState<LocationType | null>(null)
  const [center, setCenter] = useState<LocationType | null>(null)
  const [findingLocation, setFindingLocation] = useState(false)

  const { config, inputModal, handler, localePrefs } = useInputMethodProps()

  useEffect(() => {
    const { default_value, center: center2 } = config
    if (default_value) {
      setPosition(default_value)
      setCenter(default_value)
    } else {
      setCenter(center2)
      setTimeout(() => setMyLocation(), 100)
    }
  }, [])

  const submit = () => {
    setHasSubmitted(true)
    if (inputModal) {
      inputModal!.finish('location', position, config)
    }
  }

  const setMyLocation = () => {
    if (findingLocation) {
      return
    }
    setFindingLocation(true)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const position2 = { lat: coords.latitude, lon: coords.longitude }
        setPosition(position2)
        setCenter(position2)
        setFindingLocation(false)
      },
      () => {
        setFindingLocation(false)
        alert('Could not retrieve your current position, please check your location settings.')
      },
    )
  }

  const setPositionAndCenter = ({ position, center }) => {
    setPosition(position)
    setCenter(center)
  }

  const { button_label } = config

  return (
    <InputMethodContainer
      className={`fixed-height location-picker ${findingLocation ? 'finding' : ''}`}
      below={
        !hasSubmitted ? (
          <button disabled={position === null} onClick={submit}>
            {button_label || chatLabel(settings, localePrefs, 'location_picker_select')}
          </button>
        ) : null
      }
    >
      <div className="btn my-location" onClick={setMyLocation}>
        {MyLocation}
      </div>
      <Map handler={handler} onChange={setPositionAndCenter} position={position} center={center} config={config} />
    </InputMethodContainer>
  )
}

export default LocationPicker
