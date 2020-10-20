import React from "react"
import {notification, Button } from 'antd';
import numeral from 'numeral-es6';

const openNotificationWithIcon = (title: string, desc: any, type: string, duration: number = 0, onClickFunc = (() => {})) => {
    notification[type]({
      message: title,
      description: desc,
      duration: duration,
      onClick: onClickFunc
    });
  }

const openNotificationWithKey = (key: string, title: string, desc: any, type: string, duration: number = 0, onClickFunc = (() => {})) => {
   const onClickFuncWraper = (ckey) => () => {
     onClickFunc()
     notification.close(ckey) 
   }
   console.log("key=" + key)
   notification[type]({
      key: key,
      message: title,
      description: desc,
      duration: duration,
      onClick: onClickFuncWraper(key)
   });
}

const getSuterValueInteger = (suterValue: string):number => {
    if(suterValue.indexOf('.') !== -1){
      return parseInt(suterValue.split('.')[0])
    }else{
      return parseInt(suterValue)
    }
  }

const getSuterValueDecimal = (suterValue: string):string => {
  if(suterValue.indexOf('.') !== -1){
    return `.${suterValue.split('.')[1]}`
  }else{
    return ''
  }
}

const getSuterValueNumber = (suterValue: string): number => {
  let suterValueProcess = suterValue.replace(/,/g, '')
  if(suterValueProcess != ''){
    return parseFloat(suterValueProcess)
  }
  return 0
}

function suterValueForInputFunc(suterValue){
  const suterValueForInput = `${numeral(getSuterValueInteger(suterValue)).format('0,0') }${getSuterValueDecimal(suterValue)}`
  return suterValueForInput
}

function suterAmountForInput(suterValue, suterTxt) {
  const suterValueForInput = suterValueForInputFunc(suterValue, suterTxt)
  const suterAmountValue = (suterValue !== '' ? `${ suterValueForInput } ${suterTxt}` : '')
  return suterAmountValue
}

const MessageWithAlink = (props) => {
  return <a href={props.aLink} target='_blank'>{ props.message }</a>
}

const UncompleteTaskMessage = (props) => {
  const { task } = props
  const message = `View in etherscan`
  return (<div>
    <p>amount: {`${task["amount"]}`}</p>
    <div>ApproveTransaction: <a href={`${ETHERSCAN}/tx/${task["approveTxid"]}`} target='_blank'>{ message }</a></div>
    <div>{task["exchangeTxid"] != "" ? <div>ExchangeTransaction: <a href={`${ETHERSCAN}/tx/${task["approveTxid"]}`} target='_blank'>{ message }</a></div> : ''}</div>
  </div>)
}

export { openNotificationWithIcon, openNotificationWithKey, MessageWithAlink, suterValueForInputFunc, suterAmountForInput, getSuterValueNumber, UncompleteTaskMessage }