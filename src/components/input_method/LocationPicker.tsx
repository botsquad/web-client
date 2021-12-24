import React, { useEffect, useState } from 'react'
import { GoogleMap, Marker, LoadScript } from '@react-google-maps/api'

import { chatLabel } from '../../common/labels'
import { MyLocation } from '../icons'
import InputMethodContainer from './InputMethodContainer'
import { Location as LocationType } from '../elements/types'
import { useInputMethodProps } from './InputMethodContext'
import { ChatHandler } from 'components'

function transformLngLon(position: LocationType): google.maps.LatLngLiteral {
  return { lat: position.lat, lng: position.lon }
}

interface MapProps {
  center: LocationType
  position: LocationType | null
  config: { zoom?: number }
  onChange: (position: LocationType) => void
  handler: ChatHandler
  setMyLocation: () => void
}

const Map: React.FC<MapProps> = props => {
  const setMarkerPosition = ({ latLng }: any) => {
    const position = { lat: latLng.lat(), lon: latLng.lng() }
    props.onChange(position)
  }

  const { config, position } = props

  return (
    <LoadScript googleMapsApiKey={props.handler.getMapsAPIKey()}>
      <GoogleMap
        center={transformLngLon(props.center)}
        zoom={config.zoom}
        onClick={setMarkerPosition}
        options={{
          fullscreenControl: false,
          mapTypeId: 'roadmap',
        }}
      >
        {position && <Marker position={transformLngLon(position)} draggable onDragEnd={setMarkerPosition} />}
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
      setCenter(center2 || default_value)
    }
    setMyLocation()
  }, [config])

  const submit = () => {
    setHasSubmitted(true)
    inputModal?.finish('location', position, config)
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
        const position2 = { lat: 0, lon: 0 }
        setPosition(position2)
        setCenter(position2)
        alert('Could not retrieve your current position, please check your location settings.')
      },
    )
  }

  const { button_label } = config

  return (
    <InputMethodContainer
      className={`fixed-height location-picker ${findingLocation ? 'finding' : ''}`}
      below={
        !hasSubmitted ? (
          <button disabled={position === null} onClick={submit}>
            {button_label || chatLabel(settings as { ui_labels: any }, localePrefs, 'location_picker_select')}
          </button>
        ) : null
      }
    >
      <div className="btn my-location" onClick={setMyLocation}>
        {MyLocation}
      </div>
      <div className="google-map-container">
        {center && position && (
          <Map
            handler={handler}
            onChange={setPosition}
            position={position}
            center={center}
            config={config}
            setMyLocation={setMyLocation}
          />
        )}
      </div>
    </InputMethodContainer>
  )
}

export default LocationPicker
