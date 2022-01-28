import 'react-datetime/css/react-datetime.css'
import { Widget } from 'react-jsonschema-form'
import 'react-phone-number-input/style.css'
import DateTimeWidget from './FormWidgets/DateTimeWidget'
import IbanWidget from './FormWidgets/IbanWidget'
import PhoneNumberWidget from './FormWidgets/PhoneNumberWidget'

export default {
  phone_number: PhoneNumberWidget as unknown as Widget,
  iban_number: IbanWidget as unknown as Widget,
  date_picker: DateTimeWidget as unknown as Widget,
}
