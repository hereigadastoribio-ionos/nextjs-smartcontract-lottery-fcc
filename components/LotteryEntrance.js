import { useEffect, useState } from 'react';
import { useWeb3Contract, useMoralis } from 'react-moralis';
import { abi, contractAddressess } from '../constants';
import { ethers } from 'ethers';
import { useNotification } from 'web3uikit';

export default function LotteryEntrance() {
	const { chainId: chainIdHex, isWeb3Enabled } = useMoralis();
	const chainId = parseInt(chainIdHex);
	const raffleAddress =
		chainId in contractAddressess ? contractAddressess[chainId][0] : null;

	const [entranceFee, setEntranceFee] = useState('0');
	const [numPlayers, setNumPlayers] = useState('0');
	const [recentWinner, setRecentWinner] = useState('0');

	const dispatch = useNotification();
	const {
		runContractFunction: enterRaffle,
		isLoading,
		isFetching,
	} = useWeb3Contract({
		abi: abi,
		contractAddress: raffleAddress,
		functionName: 'enterRaffle',
		params: {},
		msgValue: entranceFee,
	});

	const { runContractFunction: getEntranceFee } = useWeb3Contract({
		abi: abi,
		contractAddress: raffleAddress,
		functionName: 'getEntranceFee',
		params: {},
	});

	const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
		abi: abi,
		contractAddress: raffleAddress,
		functionName: 'getNumberOfPlayers',
		params: {},
	});

	const { runContractFunction: getRecentWinner } = useWeb3Contract({
		abi: abi,
		contractAddress: raffleAddress,
		functionName: 'getRecentWinner',
		params: {},
	});

	async function updateUI() {
		const entranceFeeFromCall = (await getEntranceFee()).toString();
		const numPlayersFromCall = (await getNumberOfPlayers()).toString();
		const recentWinnerFromCall = await getRecentWinner();

		setEntranceFee(entranceFeeFromCall);
		setNumPlayers(numPlayersFromCall);
		setRecentWinner(recentWinnerFromCall);
	}

	useEffect(() => {
		if (isWeb3Enabled) {
			updateUI();
		}
	}, [isWeb3Enabled]);

	const handleSuccess = async (tx) => {
		await tx.wait(1);
		handleNewNotification(tx);
		updateUI();
	};

	const handleNewNotification = async () => {
		dispatch({
			type: 'info',
			message: 'Transaction complete',
			title: 'Tx notification',
			position: 'topR',
			icon: 'bell',
		});
	};

	return (
		<div className="p-5">
			Hi from Lottery Entrance
			{raffleAddress ? (
				<div>
					<button
						className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
						onClick={async function () {
							enterRaffle({
								onSuccess: handleSuccess,
								onError: (error) => {
									console.error(error);
								},
							});
						}}
						disabled={isLoading || isFetching}
					>
						{isLoading || isFetching ? (
							<div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
						) : (
							<div>Enter Raffle</div>
						)}
					</button>
					<div>
						Entrance fee:{' '}
						{ethers.utils.formatUnits(entranceFee, 'ether')}
						ETH
					</div>
					<div>Number of players: {numPlayers}</div>
					<div>Recent winner: {recentWinner}</div>
				</div>
			) : (
				<div>No Raffle Address Detected</div>
			)}
		</div>
	);
}
