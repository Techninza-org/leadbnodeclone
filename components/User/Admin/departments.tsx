'use client'
import { useCompany } from '@/components/providers/CompanyProvider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { useModal } from '@/hooks/use-modal-store'
import { userAtom } from '@/lib/atom/userAtom'
import { useAtomValue } from 'jotai'
import Link from 'next/link'
import React from 'react'

const Departments = () => {
  const { departments, braodcasteForm } = useCompany()
  const { onOpen } = useModal()

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="font-bold">Departments</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-8">
        {departments?.map((dept: any) => (
          <Link className='p-6 border rounded-md text-center shadow' href={`/admin/depts/${dept.name}`} key={dept.id}>
              <CardTitle>{dept.name}</CardTitle>
          </Link>
        ))}
      </CardContent>
      </Card>
      <Card className='my-3'>
        <CardHeader>
          <CardTitle className="font-bold">Broadcast</CardTitle>
        </CardHeader>
        <CardContent className='grid grid-cols-2 gap-8'>
          <Card onClick={() => onOpen("updateGlobalBroadcastForm", { dept: braodcasteForm })}>
            <CardContent className='grid place-content-center p-6 hover:bg-slate-200 cursor-pointer hover:rounded-md'>
              <CardTitle>{"Broadcast"}</CardTitle>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </>
  )
}

export default Departments