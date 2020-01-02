import React, { Fragment, useEffect } from 'react'
import ReactSelect, { Props, ValueType, OptionTypeBase } from 'react-select'
import { FormGroup, Col, FormText } from 'reactstrap'
import Label from './Label'
import classnames from 'classnames'

interface SelectProps extends Props {
  label?: string
  defaultValue?: any
  row?: boolean
  required?: boolean
  formText?: string
  error?: string
}

const Select = ({
  label,
  row,
  formText,
  error,
  required,
  ...props
}: SelectProps) => {
  const Select = (
    <Fragment>
      <ReactSelect
        className={classnames(
          'enlogy-react-select',
          error ? 'invalid' : undefined
        )}
        classNamePrefix="enlogy"
        {...props}
        components={{ IndicatorSeparator: null }}
        placeholder={props.placeholder || label || ''}
      />
      <FormText>{formText}</FormText>
      {error && (
        <FormText className="text-danger pl-3" color="red">
          {error}
        </FormText>
      )}
    </Fragment>
  )

  return (
    <FormGroup row={row}>
      {label ? (
        <Label required={required} sm={row ? 3 : undefined}>
          {label}
        </Label>
      ) : null}
      {row ? <Col sm={9}>{Select}</Col> : Select}
    </FormGroup>
  )
}

const FalseSelect = (props: SelectProps) => {
  return <Select {...props} isLoading />
}

const FormSelect = ({
  name,
  register,
  setValue,
  onChange,
  loading,
  defaultValue,
  ...props
}: FormSelectProps) => {
  useEffect(() => {
    register({ name })
  }, [name, register])

  function handleChange(e: any) {
    if (props.isMulti) {
      setValue(name, e && e.map((v: any) => v.value))
    } else {
      setValue(name, e && e.value)
    }

    props.onChange && props.onChange(e)
  }

  if (loading) {
    return <FalseSelect label={props.label} />
  } else {
    if (name === 'riskIds') console.log(defaultValue)
    return <Select {...props} onChange={handleChange} defaultValue={defaultValue} />
  }

}

export interface FormSelectProps extends SelectProps {
  name: string
  register: Function
  setValue: Function
  onChange?: (value: ValueType<OptionTypeBase>) => void
  loading?: boolean
}

export { FormSelect }
export default Select
