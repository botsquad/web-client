/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export type _EmailRecipients =
  | string
  | (
      | string
      | {
          email: string;
          first_name?: string;
          last_name?: string;
        }
    )[];

export interface InputMethodBarcode {
  button_label?: string;
  caption?: string;
  class?: string;
  confirm?: boolean;
  default_value?: null | {
    [k: string]: unknown;
  };
  event?: string;
  input_method?: "barcode";
  readers?: (
    | "code_128"
    | "ean"
    | "ean_8"
    | "code_39"
    | "code_39_vin"
    | "codabar"
    | "upc"
    | "upc_e"
    | "i2of5"
    | "2of5"
    | "code_93"
  )[];
  required?: boolean;
}
export interface InputMethodClosed {
  button?: _Button;
  caption?: string;
  class?: string;
  description?: string;
  input_method?: "closed";
  show_qr?: boolean;
}
export interface _Button {
  event?: string;
  fallback_url?: string;
  hide_modal?: boolean;
  messenger_extensions?: boolean;
  payload?: unknown;
  title?: string;
  type: string;
  url?: string;
  webview_height_ratio?: string;
  webview_share_button?: string;
}
export interface InputMethodDatePicker {
  button_label?: string;
  caption?: string;
  class?: string;
  confirm?: boolean;
  constraints?: string[];
  default_value?: null | string;
  event?: string;
  height?: "compact" | "tall" | "full";
  input_method?: "date_picker";
  required?: boolean;
  timezone?: string;
}
export interface InputMethodForm {
  button_label?: string;
  caption?: string;
  class?: string;
  default_value?: null | {
    [k: string]: unknown;
  };
  event?: string;
  height?: "compact" | "tall" | "full";
  input_method?: "form";
  required?: boolean;
  schema?: {
    [k: string]: unknown;
  };
  ui_schema?: {
    [k: string]: unknown;
  };
}
export interface InputMethodGoogleAssistantIntent {
  input_method?: "google_assistant_intent";
  intent: string;
  permissions?: string[];
}
export interface InputMethodItemPicker {
  button_label?: string;
  caption?: string;
  class?: string;
  confirm?: boolean;
  default_value?: null | string | string[];
  display?: "grid" | "list";
  event?: string;
  height?: "compact" | "tall" | "full";
  input_method?: "item_picker";
  items?:
    | string[]
    | {
        image_url?: string;
        subtitle?: string;
        title: string;
        value: string;
      }[];
  last_item?: "default" | "exclusive";
  max_items?: number;
  min_items?: number;
  mode?: "single" | "multiple";
  required?: boolean;
}
export interface InputMethodLocation {
  button_label?: string;
  caption?: string;
  center?: Location;
  class?: string;
  default_value?: null | Location;
  event?: string;
  height?: "compact" | "tall" | "full";
  input_method?: "location";
  required?: boolean;
  zoom?: number;
}
export interface Location {
  lat: number;
  lon: number;
  maptype?: "roadmap" | "terrain" | "satellite" | "hybrid";
  zoom?: number;
}
export interface InputMethodNumeric {
  caption?: string;
  class?: string;
  description?: string;
  finish_on_key?: string;
  input_method?: "numeric";
  num_digits?: number;
  required?: boolean;
}
export interface InputMethodQr {
  button_label?: string;
  caption?: string;
  class?: string;
  confirm?: boolean;
  default_value?: null | {
    [k: string]: unknown;
  };
  event?: string;
  input_method?: "qr";
  required?: boolean;
}
export interface InputMethodWait {
  button?: _Button;
  caption?: string;
  class?: string;
  description?: string;
  input_method?: "wait";
  required?: boolean;
  wait_time?: number;
}
export interface Location1 {
  lat: number;
  lon: number;
  maptype?: "roadmap" | "terrain" | "satellite" | "hybrid";
  zoom?: number;
}
export interface TemplateButtons {
  buttons: _Button[];
  template_type: string;
  text: string;
}
export interface TemplateCard {
  card: _Element;
  modal?: boolean;
  template_type: "card";
}
export interface _Element {
  buttons?: _Button[];
  default_action?: _Button;
  image_url?: string;
  section?: string;
  subtitle?: string;
  text?: string;
  title: string;
}
export interface TemplateEmail {
  attachments?: {
    caption?: string;
    type: "audio" | "file" | "image" | "video";
    url: string;
    [k: string]: unknown;
  }[];
  bcc?: _EmailRecipients;
  body?: string;
  cc?: _EmailRecipients;
  extra_headers?: {
    [k: string]: null | string;
  };
  raw_html_body?: string;
  raw_text_body?: string;
  subject?: string;
  template_type: string;
  to?: _EmailRecipients;
}
export interface TemplateGallery {
  elements: _Element[];
  modal?: boolean;
  template_type: string;
}
export interface TemplateList {
  button?: _Button;
  elements: _Element[];
  template_type: string;
  text?: string;
  top_element_style?: "compact" | "large";
}
export interface TemplateText {
  locale_override?: string;
  parameters?: {
    [k: string]: unknown;
  };
  template_id?: string;
  template_type: string;
  text?: string;
}