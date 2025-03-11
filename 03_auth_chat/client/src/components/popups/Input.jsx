import React, { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../../context/AuthProvider';

const Input = ({ update, setUpdate, setUser }) => {
    const { baseUrl } = useAuth();
    const [input, setInput] = React.useState('')
    const [isError, setIsError] = useState('')
    const userId = localStorage.getItem("senderId")

    const updateDetail = useCallback(async () => {
        const key = Object.keys(update)[0]
        update[key] = input
        try {
            const res = await fetch(`${baseUrl}/api/user/update/${userId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(update)
            }).then(res => res.json());

            if (res.status) {
                setUser(res.user)
                setUpdate('');
            }
            else {
                setIsError(res.data.message)
            }
        } catch (error) {
            console.log(error);
        }
    }, [userId, input])


    const handleChange = (e) => {
        setInput(e.target.value);
    };


    useEffect(() => {
        console.log(update)
        setInput(Object.values(update)[0])
    }, [update, setUpdate])


    return (
        <div className='fixed top-0 left-0 w-full h-full flex justify-center items-center'>
            <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black w-8/12 max-w-sm rounded-xl p-5'>

                <input className='w-full p-3 mb-5 bg-gray-800 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    type="text"
                    onChange={handleChange}
                    value={input}
                />
                <button
                    onClick={updateDetail}
                    className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none" >
                    Update
                </button>
                <p className='text-yellow-100 text-xs h-3 mt-3'>{isError}</p>
            </div>
        </div>
    )
}

export default Input