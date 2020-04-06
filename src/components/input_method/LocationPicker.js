import React from 'react'
import { compose, withProps } from 'recompose'
import { withScriptjs, withGoogleMap, GoogleMap, Marker } from 'react-google-maps'

import { chatLabel } from '../../common/labels'
import { MyLocation } from '../icons'
import InputMethodContainer from './InputMethodContainer'

function transformLngLon(position) {
  position = position ? { lat: position.lat, lng: position.lon } : null
  return position
}

class Map extends React.Component {
  setMarkerPosition = ({ latLng }) => {
    const center = { lat: this.map.getCenter().lat(), lon: this.map.getCenter().lng() }
    const position = { lat: latLng.lat(), lon: latLng.lng() }
    this.props.onChange({ position, center })
  }

  componentWillReceiveProps() {
    this.setState({ center: null })
  }

  render() {
    let { position } = this.props
    const { config } = this.props

    position = transformLngLon(position)
    const center = transformLngLon(this.props.center)

    return (
      <GoogleMap
        ref={(m) => { this.map = m }}
        defaultZoom={config.zoom}
        defaultCenter={center}
        center={center}
        onClick={this.setMarkerPosition}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
          fullscreenControl: true,
          clickableIcons: false,
          mapTypeIds: ['roadmap'],
        }}
      >
        {position ? <Marker position={position} draggable onDragEnd={this.setMarkerPosition} /> : null}
      </GoogleMap>
    )
  }
}

const ComposedMap = compose(
  withProps((props) => {
    const mapsApiKey = props.handler.getMapsAPIKey()

    return {
      googleMapURL: `https://maps.googleapis.com/maps/api/js?v=3.exp&key=${mapsApiKey}&libraries=geometry,drawing,places`,
      loadingElement: <div style={{ height: '100%', width: '100%' }} />,
      containerElement: <div style={{ height: '100%', width: '100%' }} />,
      mapElement: <div style={{ height: '100%', width: '100%' }} />,
    }
  }),
  withScriptjs,
  withGoogleMap
)(Map)

export default class LocationPicker extends React.Component {
  state = {
    hasSubmitted: false,
    position: null,
    center: null,
    findingLocation: false,
  }

  componentWillMount() {
    const { default_value, center } = this.props.config
    if (default_value) {
      this.setState({ position: default_value, center: default_value })
    } else {
      this.setState({ center })
      setTimeout(() => this.setMyLocation(), 100)
    }
  }

  submit = () => {
    this.setState({ hasSubmitted: true })
    this.props.inputModal.finish('location', this.state.position, this.props.config)
  }

  setMyLocation = () => {
    if (this.state.findingLocation) {
      return
    }
    this.setState({ findingLocation: true })
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      const position = { lat: coords.latitude, lon: coords.longitude }
      this.setState({ position, center: position, findingLocation: false })
    }, () => {
      this.setState({ findingLocation: false })
      alert('Could not retrieve your current position, please check your location settings.')
    })
  }

  setPosition = ({ position, center }) => {
    this.setState({ position, center })
  }

  render() {
    const { button_label } = this.props.config

    return (
      <InputMethodContainer
        {...this.props}
        className={`fixed-height location-picker ${this.state.findingLocation ? 'finding' : ''}`}
        below={!this.state.hasSubmitted ? <button disabled={this.state.position === null} onClick={this.submit}>{button_label || chatLabel(this, 'location_picker_select')}</button> : null}
      >
        <div className="btn my-location" onClick={this.setMyLocation}>{MyLocation}</div>
        <ComposedMap handler={this.props.handler} onChange={this.setPosition} position={this.state.position} center={this.state.center} config={this.props.config} />
      </InputMethodContainer>
    )
  }
}
