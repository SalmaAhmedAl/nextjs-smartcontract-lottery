import { useWeb3Contract } from "react-moralis"
import { abi, contractAddresses } from "../constants"
import Raffle from "../constants/Raffle.json"
import { useMoralis } from "react-moralis"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { useNotification } from "web3uikit"
//have a function to call a lottery (to enter the entrance)
export default function LotteryEntrance() {
    const { chainId: chainIdHex, isWeb3Enabled } = useMoralis()
    const chainId = parseInt(chainIdHex)
    const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null
    const [entranceFee, setEntranceFee] = useState("0") //entranceFee is a variable and "0" ia starting value.. setEntranceFee is a function
    const dispatch = useNotification()

    //Function we will call to enter the lottery (runContractFunction)
    const { runContractFunction: enterRaffle } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "enterRaffle",
        params: {},
        msgValue: entranceFee,
    })
    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getEntranceFee",
        params: {},
    })

    useEffect(() => {
        if (isWeb3Enabled) {
            //try to read raffle entrace fee value
            async function updateUi() {
                const entranceFeeFromCall = (await getEntranceFee()).toString()
                console.log(entranceFeeFromCall)
                setEntranceFee(entranceFeeFromCall)
            }
            updateUi()
        }
    }, [isWeb3Enabled])

    const handleSuccess = async function(tx){
        await tx.wait(1)
        handleNotification()
    }
    const handleNotification = function(){
        dispatch({
            type:"info",
            message:"Transaction complete!",
            title:"Tx Notification",
            position:"topR",
            icon:"bell"
        })
    }
    return (
        <div>
            Hi from Lottery entrance!
            {raffleAddress ? (
                <div>
                    <button
                        onClick={async function () {
                            await enterRaffle({
                                onSuccess:handleSuccess,
                            })
                        }}
                    >
                        Enter Raffle
                    </button>
                     Entrance Fee: {ethers.utils.formatUnits(entranceFee, "ether")} ETH
                </div>
            ) : (
                <div>No Raffle Address Detected</div>
            )}
        </div>
    )
}
