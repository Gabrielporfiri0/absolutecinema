// import Image from "next/image";
'use client'
import { localStorageUtil } from "@/lib/localStorage_";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [name_, setName_] = useState<string>('')
  const [cpf_, setCPF_] = useState<string>('')
  const [seat_, setSeat_] = useState<number>(0)
  const [ID_update, setID_update] = useState<string>('')
  const [ID_remove, setID_remove] = useState<string>('')

  const handleRegisterNewTicket = async () => {
    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: name_,
          cpf: cpf_,
          seat: seat_
        })
      })

      const returnedResponse = await response.json()
      console.log('CADASTRAR: ', returnedResponse)

      if (returnedResponse.status === 201) {
        setName_('')
        setCPF_('')
        setSeat_(0)
      }

    } catch (error) {
      console.log('Erro ao registrar novo ingresso: ', error)
      alert('Erro ao registrar novo ingresso !!!')
    }
  }

  const handleDeleteTicket = async () => {
    try {
      const response = await fetch('/api/tickets', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: ID_remove })
      })

      const returnedResponse = await response.json()
      console.log('DELETAR: ', returnedResponse)

      if (returnedResponse.status === 200) {
        alert('Ingresso deletado com sucesso !!')
        setID_remove('')
      }
    } catch (error) {
      console.log('Erro ao deletar ingresso: ', error)
      alert('Erro ao deletar ingresso !!!')
    }
  }

  const getUniqueTicket = async (id__: string) => {
    try {
      const response = await fetch(`/api/tickets/${id__}`)
      const returnedResponse = await response.json()

      if (returnedResponse.status === 200) {
        console.log('Ingresso encontrado com sucesso !!')
        console.log('BUSCAR POR ID: ' ,returnedResponse)
        return returnedResponse.ticket_data
      }

      if(returnedResponse.status === 404 || returnedResponse.status === 400 || returnedResponse.status === 500){
        console.log('BUSCAR POR ID' ,returnedResponse)
        return null
      }

    } catch (error) {
      console.log('Erro ao buscar dados do ingresso em questão')
      alert('Erro ao buscar dados do ingresso')
    }
  }

  const handleUpdateTicket = async () => {
    try {
      const ticket_data_ = await getUniqueTicket(ID_update)

      if(!ticket_data_) return console.log('Erro ao atualizar ingresso.')

      const response = await fetch('/api/tickets', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          _id: ID_update,
          name: name_,
          cpf: cpf_,
          seat: seat_,
          createdAt: ticket_data_.createdAt,
          updatedAt: ticket_data_.updatedAt
        })
      })

      const returnedResponse = await response.json()
      console.log('ATUALIZAR: ' ,returnedResponse)

      if (returnedResponse.status === 200) {
        alert('Produto atualizado com sucesso')
        setCPF_('')
        setID_update('')
        setName_('')
        setSeat_(0)
      }
    } catch (error) {
      console.log('Erro ao atualizar ingresso: ', error)
      alert('Erro ao atualizar ingresso !!!')
    }
  }

  const lookForTickets = async () => {
    try {
      const response = await fetch('/api/tickets')
      const returnedResponse = await response.json()

      if (returnedResponse.status === 200) console.log(returnedResponse.tickets__)
    } catch (error) {
      console.log('Erro ao buscar produtos: ', error)
      alert('Erro ao buscar produtos !!!')
    }
  }

  const lookForSeats = async () => {
    try {
      const response = await fetch('/api/tickets/getAllSeats')
      const returnedResponse = await response.json()

      if (returnedResponse.status === 200) console.log(returnedResponse.seats__)
    } catch (error) {
      console.log('Erro ao buscar assentos ', error)
      alert('Erro ao buscar assentos !!!')
    }
  }

  const removeToken = () => {
    const isTokenRemoved = localStorageUtil.removeItem('acessToken')

    if(isTokenRemoved) alert('Token removido com sucesso')
    if(!isTokenRemoved) alert('Erro ao remover token')
  }

  return (
    <div className="flex flex-col justify-center items-center gap-2">
      <h2>Bem vindo a home</h2>
      <input
        type="text"
        placeholder="Informe seu nome"
        className="p-5 border border-black"
        value={name_}
        onChange={(e) => setName_(e.target.value)}
      />

      <input
        type="text"
        placeholder="Informe seu cpf"
        className="p-5 border border-black"
        value={cpf_}
        onChange={(e) => setCPF_(e.target.value)}
      />

      <input
        type="number"
        placeholder="Informe o número do assento"
        className="p-5 border border-black"
        value={seat_}
        onChange={(e) => setSeat_(Number(e.target.value))}
      />

      <button
        className="p-5 bg-blue-500 hover:cursor-pointer hover:bg-blue-700 font-bold rounded-2xl"
        onClick={handleRegisterNewTicket}
      >
        Cadastrar
      </button>

      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Informe seu id"
          className="p-5 border border-black"
          value={ID_remove}
          onChange={(e) => setID_remove(e.target.value)}
        />

        <button
          className="p-5 bg-blue-500 hover:cursor-pointer hover:bg-blue-700 font-bold rounded-2xl"
          onClick={handleDeleteTicket}
        >
          Remover
        </button>
      </div>

      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Informe seu id"
          className="p-5 border border-black"
          value={ID_update}
          onChange={(e) => setID_update(e.target.value)}
        />

        <button
          className="p-5 bg-blue-500 hover:cursor-pointer hover:bg-blue-700 font-bold rounded-2xl"
          onClick={handleUpdateTicket}
        >
          Atualizar
        </button>
      </div>

      <button
        className="p-5 bg-blue-500 hover:cursor-pointer hover:bg-blue-700 font-bold rounded-2xl"
        onClick={lookForTickets}
      >
        Ver ingressos
      </button>

      <button
        className="p-5 bg-blue-500 hover:cursor-pointer hover:bg-blue-700 font-bold rounded-2xl"
        onClick={lookForSeats}
      >
        Ver números dos assentos reservados
      </button>

      <div className="flex gap-4">
        <Link
          href={'/adminPage/register'}
          className="p-5 bg-blue-500 hover:cursor-pointer hover:bg-blue-700 font-bold rounded-2xl"
        >
          Ir para página de registro do admin
        </Link>
        <Link
          href={'/adminPage/login'}
          className="p-5 bg-blue-500 hover:cursor-pointer hover:bg-blue-700 font-bold rounded-2xl"
        >
          Ir para página de login do admin
        </Link>
      </div>

      <button
        className="p-5 bg-blue-500 hover:cursor-pointer hover:bg-blue-700 font-bold rounded-2xl"
        onClick={removeToken}
      >
        Remover Token
      </button>
    </div>
  );
}
