import 'react-datetime/css/react-datetime.css'
import { Widget } from 'react-jsonschema-form'
import 'react-phone-number-input/style.css'
import DateTimeWidget from './FormWidgets/DateTimeWidget'
import IbanWidget from './FormWidgets/IbanWidget'
import PhoneNumberWidget from './FormWidgets/PhoneNumberWidget'

export default {
  phone_number: PhoneNumberWidget,
  iban_number: IbanWidget,
  date_picker: DateTimeWidget,
} as unknown as Record<string, Widget>
