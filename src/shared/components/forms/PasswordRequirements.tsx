import React, { Fragment } from 'react'

interface PasswordRequirements {
  falsePasswordLength: boolean;
  noCapitalPassword: boolean;
  noLowerCasePassword: boolean;
  noSpecialCharacterPassword: boolean;
  noNumberPassword: boolean;
}

export const PasswordRequirements = ({
  falsePasswordLength,
  noCapitalPassword,
  noLowerCasePassword,
  noSpecialCharacterPassword,
  noNumberPassword,
}: PasswordRequirements) => {
  return (
    <Fragment>
      <h6 style={{ fontSize: "14px", color: "crimson" }}>
        Password requirements:
      </h6>
      <ul className="text-red">
        {falsePasswordLength && (
          <li>At least 8 characters</li>
        )}
        {noCapitalPassword && (
          <li>Uppercase characters (A - Z)</li>
        )}
        {noLowerCasePassword && (
          <li>Lowercase characters (a - z)</li>
        )}
        {noSpecialCharacterPassword && (
          <li>Special characters ({` ~!"#$%&'()*+=,-./:;<>?@[\\\`]^_{|}'`})</li>
        )}
        {noNumberPassword && (
          <li>Numbers (0 - 9)</li>
        )}
      </ul>
    </Fragment>
  )
}