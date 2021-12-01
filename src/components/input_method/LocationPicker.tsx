import React, { ReactNode, useEffect, useState } from 'react'
import { compose, withProps } from 'recompose'
import { withScriptjs, withGoogleMap, GoogleMap, Marker } from 'react-google-maps'

import { chatLabel } from '../../common/labels'
import { MyLocation } from '../icons'
import InputMethodContainer from './InputMethodContainer'
import { Location as LocationType } from '../elements/types'
import { useInputMethodProps } from './InputMethodContext'

function transformLngLon(position: LocationType) {
  return position ? { lat: position.lat, lng: position.lon } : null
}

interface MapProps {
  center: LocationType
  position: LocationType
  config: { zoom?: number }
  onChange: ([string]: any) => void
  handler: any
}

const Map: React.FC<MapProps> = props => {
  const [map, setMap] = useState<GoogleMap | null>()

  const setMarkerPosition = ({ latLng }) => {
    const center = { lat: map!.getCenter().lat(), lon: map!.getCenter().lng() }
    const position = { lat: latLng.lat(), lon: latLng.lng() }
    props.onChange({ position, center })
  }

  const { config, position } = props

  const googleMapsPosition = transformLngLon(position)
  const center = transformLngLon(props.center)

  return (
    <GoogleMap
      ref={m => {
        setMap(m)
      }}
      defaultZoom={config.zoom}
      defaultCenter={center ? center : undefined}
      center={center ? center : undefined}
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
  )
}

const ComposedMap = compose<MapProps, { children?: ReactNode }>(
  withProps((props: MapProps) => {
    const mapsApiKey = props.handler.getMapsAPIKey()

    return {
      googleMapURL: `https://maps.googleapis.com/maps/api/js?v=3.exp&key=${mapsApiKey}&libraries=geometry,drawing,places`,
      loadingElement: <div style={{ height: '100%', width: '100%' }} />,
      containerElement: <div style={{ height: '100%', width: '100%' }} />,
      mapElement: <div style={{ height: '100%', width: '100%' }} />,
    }
  }),
  withScriptjs,
  withGoogleMap,
)(Map)

interface LocationPickerProps {
  settings: any
  localePrefs: string[]
}

const LocationPicker: React.FC<LocationPickerProps> = ({ settings, localePrefs }) => {
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [position, setPosition] = useState<LocationType | null>(null)
  const [center, setCenter] = useState<LocationType | null>(null)
  const [findingLocation, setFindingLocation] = useState(false)

  const { config, inputModal, handler } = useInputMethodProps()

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
    inputModal!.finish('location', position, config)
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
      <ComposedMap
        handler={handler}
        onChange={setPositionAndCenter}
        position={position}
        center={center}
        config={config}
      />
    </InputMethodContainer>
  )
}

export default LocationPicker
