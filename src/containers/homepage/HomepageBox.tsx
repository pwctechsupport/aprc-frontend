import React, { useState } from 'react'
import { FaCaretRight } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { Collapse } from 'reactstrap'
import styled, { css } from 'styled-components'
import EmptyAttribute from '../../shared/components/EmptyAttribute'
import { Suggestions } from '../../shared/formatter'
import useWindowSize from '../../shared/hooks/useWindowSize'

interface HomepageBoxProps {
  list: Suggestions
  title?: string | null
  basePath: string
  themeColor?: string
  fontColor?: string
}

export default function HomepageBox({
  list,
  title,
  basePath,
  themeColor,
  fontColor = 'white',
}: HomepageBoxProps) {
  const [open, setOpen] = useState(true)
  const [textHeight, setTextHeight] = useState(0)
  const { height } = useWindowSize()
  const heigthAdjustment = open
    ? `${(height * 50) / 100 - textHeight}px`
    : undefined
  return (
    <div
      className="my-2"
      style={{
        backgroundColor: themeColor,
        boxShadow: '3px 6px 20px 0px rgba(0,0,0,0.3)',
        borderRadius: '3px',
        border: '1px solid rgba(0,0,0,0.1)',
      }}
    >
      <div
        className="d-flex justify-content-between align-items-flex-start p-2 pt-3"
        style={{
          borderBottom: '1px solid rgba(0,0,0,0.3)',
        }}
        ref={(ref) => setTextHeight(ref?.clientHeight || 0)}
      >
        <h5 style={{ color: fontColor }}>{title}</h5>
        <BoxHeader onClick={() => setOpen((p) => !p)}>
          <Icon open={open} />
        </BoxHeader>
      </div>
      {/* <Collapse isOpen={open}> */}
      <div className="p-2" style={{ minHeight: heigthAdjustment }}>
        {list.length ? (
          list.slice(0, open ? 7 : 3).map((item) => (
            <StyledLink
              key={item.value}
              to={
                basePath === 'policy'
                  ? `/${basePath}/${item.value}/details`
                  : `/${basePath}/${item.value}`
              }
              style={{ color: fontColor }}
              className="d-flex align-items-center my-2"
            >
              <div className="mr-3">
                <Circle>{item.label.charAt(0).toUpperCase()}</Circle>
              </div>
              <StyledSpan>{item.label}</StyledSpan>
            </StyledLink>
          ))
        ) : (
          <div style={{ paddingTop: '13vh' }}>
            <EmptyAttribute style={{ color: fontColor }}>
              No {title}
            </EmptyAttribute>
          </div>
        )}
      </div>
      {/* </Collapse> */}
    </div>
  )
}
const StyledSpan = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  max-height: 3.6em;
`

const StyledLink = styled(Link)`
  color: rgba(0, 0, 0, 0.5);
  font-size: larger;
  transition: 0.1s ease-in-out;
  &:hover {
    text-decoration: none;
    color: rgba(0, 0, 0, 0.8);
  }
  padding: 5px;
`

const Circle = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  font-size: 18px;
  color: #fff;
  text-align: center;
  background: rgba(0, 0, 0, 0.4);
  transition: 0.1s ease-in-out;
  ${StyledLink}:hover & {
    background: rgba(0, 0, 0, 0.8);
  }
`

const BoxHeader = styled.div`
  padding: 5px 7px;
  cursor: pointer;
  border-radius: 3px;
  transition: 0.15s ease-in-out;
  &:hover {
    background: rgba(0, 0, 0, 0.1);
  }
`

const Icon = styled(FaCaretRight)<{ open: boolean }>`
  transition: 0.15s ease-in-out;
  ${(p: { open: boolean }) =>
    p.open &&
    css`
      transform: rotate(90deg);
    `};
`
