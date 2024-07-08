"use client"

import { MoreHorizontal } from "lucide-react"
import { Row } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useModal } from "@/hooks/use-modal-store"
import { leadSchema } from "@/types/lead"
import { z } from "zod"
import { useQuery } from "graphql-hooks"
import { companyQueries } from "@/lib/graphql/company/queries"
import { userAtom } from "@/lib/atom/userAtom"
import { useAtomValue } from "jotai"
import { CompanyDeptFieldSchema } from "@/types/company"


interface DataTableRowActionsProps<TData> {
  lead: z.infer<typeof leadSchema>
}

export function AssignedLeadTableRowActions<TData>({
  lead,
}: DataTableRowActionsProps<TData>) {
  const user = useAtomValue(userAtom)

  const { loading, error, data } = useQuery(companyQueries.GET_COMPANY_DEPT_FIELDS, {
    variables: { deptId: user?.deptId },
  });

  const { onOpen } = useModal()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        {
          data?.getCompanyDeptFields?.map((field: z.infer<typeof CompanyDeptFieldSchema>) => (
            <DropdownMenuItem key={field.id} onClick={() => onOpen("submitLead", { lead, fields: field })}>
              {field.name}
            </DropdownMenuItem>
          ))
        }
        {/* <DropdownMenuSeparator /> */}
        {/* <DropdownMenuSub>
          <DropdownMenuSubTrigger>Labels</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup value={task.label}>
              {labels.map((label) => (
                <DropdownMenuRadioItem key={label.value} value={label.value}>
                  {label.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub> */}
        {/* <DropdownMenuSeparator /> */}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
