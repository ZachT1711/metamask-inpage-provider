module.exports = {
  errors: {
    invalidParams: () => `The MetaMask Ethereum provider does not support your given parameters. Please use ethereum.send(method: string, params: Array<any>). For more details, see: https://eips.ethereum.org/EIPS/eip-1193`,
    unsupportedSync: method => `The MetaMask Web3 object does not support synchronous methods like ${method} without a callback parameter.`
  },
  warnings: {
    // deprecated stuff yet to be removed
    enableDeprecation: `MetaMask: 'ethereum.enable()' is deprecated and may be removed in the future. Please use "ethereum.send('eth_requestAccounts')" instead. For more information, see: https://eips.ethereum.org/EIPS/eip-1102`,
    isConnectedDeprecation: `MetaMask: 'ethereum.isConnected()' is deprecated and may be removed in the future. Please listen for the relevant events instead. For more information, see: https://eips.ethereum.org/EIPS/eip-1193`,
    sendAsyncDeprecation: `MetaMask: 'ethereum.sendAsync(...)' is deprecated and may be removed in the future. Please use 'ethereum.send(method: string, params: Array<any>)' instead. For more information, see: https://eips.ethereum.org/EIPS/eip-1193`,
    signTypedDataDeprecation: `MetaMask: 'eth_signTypedData' is deprecated and may be removed in the future, in favor of EIP-712. For more information, see: https://git.io/fNzPl`,
    // misc
    experimentalMethods: `MetaMask: 'ethereum._metamask' exposes methods that have not been standardized yet. This means that these methods may not be implemented in other dapp browsers and may be removed from MetaMask in the future.`,
  }
}
