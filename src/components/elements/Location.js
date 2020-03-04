import React from 'react';
import { compose, withProps } from "recompose"
import { withScriptjs, withGoogleMap, GoogleMap, Marker } from "react-google-maps"
import { MyLocation } from '../icons'

function transformLngLon(position) {
  return position = position ? { lat: position.lat, lng: position.lon } : null
}

class Map extends React.Component {
  state = {
    address: null
  }

  click = () => {
    const { payload } = this.props.message
    const url = `http://maps.google.com/?q=${payload.lat},${payload.lon}`
    window.open(url, '_blank')
    this.props.handler.sendLinkClick(url)
  }

  componentDidMount() {
    var geocoder = new google.maps.Geocoder;
    const latlng = transformLngLon(this.props.message.payload)
    geocoder.geocode({'location': latlng}, (results, status) => {
      if (results && results[0]) {
        const address = results[0].formatted_address
        this.setState({ address })
      }
    })
  }

  render() {
    const { payload } = this.props.message
    const center = transformLngLon(payload)

    return (
      <div>
        <GoogleMap
          defaultZoom={14}
          defaultCenter={center}
          center={center}
          onClick={this.click}
          options={{
            disableDefaultUI: true,
            zoomControl: true,
            clickableIcons: false,
            mapTypeIds: ['roadmap']}}
        >
          <Marker position={center} onClick={this.click} />
        </GoogleMap>
        <div className="address">{this.state.address}</div>
      </div>
    )
  }
}

const ComposedMap = compose(
  withProps(r => {
    const { clientHeight } = r.handler.getClientDimensions()
    const height = Math.floor(clientHeight * 0.6) + 'px'
    const mapsApiKey = r.handler.getMapsAPIKey()

    return {
      googleMapURL: `https://maps.googleapis.com/maps/api/js?v=3.exp&key=${mapsApiKey}&libraries=geometry,drawing,places`,
      loadingElement: <div style={{ height,  width: '100%' }} />,
      containerElement: <div style={{ height: '100%', width: '100%' }} />,
      mapElement: <div style={{ height, width: '100%' }} />,
    }
  }),
  withScriptjs,
  withGoogleMap
)(Map)


class StaticLocation extends React.PureComponent {
  render() {
    const { className, message, handler } = this.props
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
}

export default class Location extends React.PureComponent {
  render() {
    const { payload } = this.props.message
    if (!payload || !payload.lat) {
      return null
    }

    if (this.props.modal) {
      return <ComposedMap {...this.props} />
    }

    return <StaticLocation {...this.props} />
  }
}
