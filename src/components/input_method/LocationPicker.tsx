import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { GoogleMap, Marker, LoadScript } from '@react-google-maps/api'

import { chatLabel } from '../../common/labels'
import { MyLocation } from '../icons'
import InputMethodContainer from './InputMethodContainer'
import { Location as LocationType } from '../elements/types'
import { useInputMethodProps } from './InputMethodContext'
import { ChatHandler } from 'components'
import { InputMethodLocation } from 'show_types'

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
  const [map, setMap] = useState<google.maps.Map>()
  const setMarkerPosition = ({ latLng }: any) => {
    const position = { lat: latLng.lat(), lon: latLng.lng() }
    props.onChange(position)
  }

  const { config, position } = props

  return (
    <LoadScript googleMapsApiKey={props.handler.getMapsAPIKey()}>
      <GoogleMap
        onLoad={map => setMap(map)}
        center={transformLngLon(props.center)}
        zoom={config.zoom}
        onClick={pos => {
          if (pos.latLng) {
            setMarkerPosition(pos)
            map?.setCenter(pos.latLng)
          }
        }}
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
  const { config, inputModal, handler, localePrefs } = useInputMethodProps<InputMethodLocation>()
  
  const initialPosition = useMemo(() => config.default_value || null, [config.default_value])
  const initialCenter = useMemo(() => config.center || config.default_value || null, [config.center, config.default_value])

  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [position, setPosition] = useState<LocationType | null>(initialPosition)
  const [center, setCenter] = useState<LocationType | null>(initialCenter)
  const [findingLocation, setFindingLocation] = useState(false)

  const setMyLocation = useCallback(() => {
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
  }, [findingLocation])

  useEffect(() => {
    // Only call setMyLocation if we don't have a default position
    if (!initialPosition) {
      setMyLocation()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const submit = () => {
    setHasSubmitted(true)
    inputModal?.finish('user_location', position, config)
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
