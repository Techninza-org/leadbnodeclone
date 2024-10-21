// @ts-nocheck
"use client"
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm, useFieldArray, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useAtomValue } from "jotai"
import { useQuery, useMutation } from "graphql-hooks"
import { ArrowDown, ArrowUp, Check, ChevronsUpDownIcon, PlusIcon, X } from "lucide-react"

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from '@/components/ui/use-toast'

import { deptQueries } from "@/lib/graphql/dept/queries"
import { DeptMutation } from "@/lib/graphql/dept/mutation"
import { userAtom } from "@/lib/atom/userAtom"
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command'
import { cn } from '@/lib/utils'

const DepartmentSchema = z.object({
    deptFields: z.array(z.object({
        name: z.string().min(1, "Field name is required"),
        fieldType: z.string().min(1, "Field type is required"),
        ddOptionId: z.any().optional(),
        order: z.number().int().min(1, "Field order is required"),
        options: z.array(z.object({
            label: z.string(),
            value: z.any(),
        })).default([]),
        isRequired: z.boolean(),
        isDisabled: z.boolean(),
    })).default([]),
})

const fieldTypes = [
    { value: "INPUT", label: "Input" },
    { value: "SELECT", label: "Select" },
    { value: "RADIO", label: "Radio" },
    { value: "DD_IMG", label: "Dependent Dropdown (Image)" },
    { value: "DD", label: "Dependent Dropdown (Select)" },
    { value: "CHECKBOX", label: "Checkbox" },
    { value: "IMAGE", label: "Image" },
    { value: "TEXTAREA", label: "Textarea" },
    { value: "DATE", label: "Date" },
]


const languages = [
    { label: "English", value: "en" },
    { label: "French", value: "fr" },
    { label: "German", value: "de" },
    { label: "Spanish", value: "es" },
    { label: "Portuguese", value: "pt" },
    { label: "Russian", value: "ru" },
    { label: "Japanese", value: "ja" },
    { label: "Korean", value: "ko" },
    { label: "Chinese", value: "zh" },
] as const


const UpdateDepartmentFieldsModal = ({ deptName, deptId }) => {
    const [currIdx, setCurrIdx] = useState(0)
    const userInfo = useAtomValue(userAtom)
    const { toast } = useToast()
    const [updateDepartmentFields] = useMutation(DeptMutation.UPDATE_DEPT)

    const form = useForm({
        resolver: zodResolver(DepartmentSchema),
        defaultValues: { deptFields: [] },
    })

    const { fields, append, remove, update } = useFieldArray({
        control: form.control,
        name: "deptFields",
    })

    const { data } = useQuery(deptQueries.GET_COMPANY_DEPT_FIELDS, {
        variables: { deptId },
        skip: !userInfo?.token || !deptId,
    })

    const filteredDeptFields = useMemo(() =>
        data?.getCompanyDeptFields?.filter(field => String(field.name) === String(deptName)) || [],
        [data, deptName])

    useEffect(() => {
        if (filteredDeptFields.length > 0) {
            const sortedSubDeptFields = filteredDeptFields[0]?.subDeptFields?.sort((a, b) => a.order - b.order) || []
            form.reset({ deptFields: sortedSubDeptFields })
        }
    }, [filteredDeptFields, form])

    const onSubmit = useCallback(async (values) => {
        // console.log(JSON.stringify(values.deptFields, null, 2), "values.deptFields")
        try {
            const { data, error } = await updateDepartmentFields({
                variables: {
                    input: {
                        companyDeptId: deptId || "",
                        name: deptName,
                        order: 4,
                        subDeptFields: values.deptFields,
                    }
                },
            });

            if (error) {
                const message = error?.graphQLErrors?.map((e) => e.message).join(", ");
                toast({
                    title: 'Error',
                    description: message || "Something went wrong",
                    variant: "destructive"
                });
                return;
            }

            toast({
                variant: "default",
                title: "Department Form Updated Successfully!",
            });

        } catch (error) {
            console.error(error);
        }
    }, [])

    const handleSelectChange = useCallback((value, index) => {
        form.setValue(`deptFields.${index}.fieldType`, value)
        if (['SELECT', 'RADIO', 'DROPDOWN', 'CHECKBOX'].includes(value)) {
            const currentOptions = form.getValues(`deptFields.${index}.options`) || []
            if (currentOptions.length === 0) {
                form.setValue(`deptFields.${index}.options`, [])
            }
        }
    }, [form])

    const moveField = useCallback((index, direction) => {
        const newIndex = index + direction
        if (newIndex < 0 || newIndex >= fields.length) return

        const updatedFields = fields.map((field, idx) => ({
            ...field,
            order: idx === index ? newIndex + 1 : idx === newIndex ? index + 1 : idx + 1,
        }))

        updatedFields.splice(newIndex, 0, updatedFields.splice(index, 1)[0])
        form.setValue('deptFields', updatedFields)
    }, [fields, form])

    const renderFieldOptions = useCallback(() => {
        const fieldType = form.watch(`deptFields.${currIdx}.fieldType`)

        if (['SELECT', 'RADIO', 'CHECKBOX'].includes(fieldType)) {
            return (
                <div className="mt-4">
                    <FormLabel className="mr-2">Options</FormLabel>
                    {form.watch(`deptFields.${currIdx}.options`)?.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center mb-2 mt-2">
                            <Input
                                placeholder="Value"
                                className="mr-2"
                                value={option.label || option.value}
                                onChange={(e) => {
                                    const value = e.target.value
                                    const options = form.getValues(`deptFields.${currIdx}.options`)
                                    options[optIndex] = { label: value, value }
                                    form.setValue(`deptFields.${currIdx}.options`, options)
                                }}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                    const options = form.getValues(`deptFields.${currIdx}.options`)
                                    options.splice(optIndex, 1)
                                    form.setValue(`deptFields.${currIdx}.options`, options)
                                }}
                            >
                                <X size={20} color="red" />
                            </Button>
                        </div>
                    ))}
                    <Button
                        type="button"
                        onClick={() => {
                            const options = form.getValues(`deptFields.${currIdx}.options`) || []
                            options.push({ label: '', value: '' })
                            form.setValue(`deptFields.${currIdx}.options`, options)
                        }}
                        className="mt-2 bg-blue-500 text-white"
                    >
                        <PlusIcon size={15} />
                        Add Option
                    </Button>
                </div>
            )
        }

        if (fieldType === 'DD' || fieldType === 'DD_IMG') {
            return (
                <div className="mt-4">
                    <FormLabel className="mr-2">Dependent On</FormLabel>
                    <Select
                        onValueChange={(value) => form.setValue(`deptFields.${currIdx}.ddOptionId`, value)}
                        value={form.watch(`deptFields.${currIdx}.ddOptionId`) || undefined}
                    >
                        <SelectTrigger className="w-[250px]">
                            <SelectValue placeholder="Select dependency" />
                        </SelectTrigger>
                        <SelectContent>
                            {form.watch('deptFields').filter(x => ["SELECT", "DD"].includes(x.fieldType)).map((field, index) => (
                                field.name !== form.watch(`deptFields.${currIdx}.name`) && <SelectItem key={index} value={field.name}>
                                    {field.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {form.watch(`deptFields.${currIdx}.ddOptionId`) && (
                        <div className="mt-4">
                            <FormLabel className="mr-2 block">Select Values from Linked Field</FormLabel>
                            <Controller
                                name={`deptFields.${currIdx}.linkedFieldValues`}
                                control={form.control}
                                render={({ field }) => (
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className={cn(
                                                        "w-[250px] justify-between",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value || "Select values"}
                                                    <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[250px] p-0">
                                            <Command>
                                                <CommandInput placeholder="Search language..." />
                                                <CommandList>
                                                    <CommandEmpty>No language found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {(() => {
                                                            const selectedParent = filteredDeptFields[0]?.subDeptFields.find(
                                                                (subField) => subField.name === form.watch(`deptFields.${currIdx}.ddOptionId`)
                                                            )
                                                            if (selectedParent?.fieldType === "SELECT") {
                                                                return selectedParent.options.map((option, optIndex) => (
                                                                    option.label && <CommandItem
                                                                        key={`${option.label}-${optIndex}`}
                                                                        value={option.label}
                                                                        onSelect={(value) => {
                                                                            field.onChange(value)
                                                                            const options = form.getValues(`deptFields.${currIdx}.options`) || []
                                                                            if (!options.find(x => x.label === value)) {
                                                                                options.push({ label: value, value: [] })
                                                                                form.setValue(`deptFields.${currIdx}.options`, options)
                                                                            }
                                                                        }}
                                                                    >
                                                                        <Check
                                                                            className={cn(
                                                                                "mr-2 h-4 w-4",
                                                                                option.value === field.value
                                                                                    ? "opacity-100"
                                                                                    : "opacity-0"
                                                                            )}
                                                                        />
                                                                        {option.label}
                                                                    </CommandItem>
                                                                ))
                                                            }
                                                            if (selectedParent?.fieldType === 'DD') {
                                                                return selectedParent.options.flatMap((pOption) =>
                                                                    pOption.value.map((option, optIndex) => (
                                                                        option.label && <CommandItem
                                                                            key={`${option.label}-${optIndex}`}
                                                                            value={option.label}
                                                                            onSelect={(value) => {
                                                                                field.onChange(value)
                                                                                const options = form.getValues(`deptFields.${currIdx}.options`) || []
                                                                                if (!options.find(x => x.label === value)) {
                                                                                    options.push({ label: value, value: [] })
                                                                                    form.setValue(`deptFields.${currIdx}.options`, options)
                                                                                }
                                                                            }}
                                                                        >
                                                                            <Check
                                                                                className={cn(
                                                                                    "mr-2 h-4 w-4",
                                                                                    option.value === field.value
                                                                                        ? "opacity-100"
                                                                                        : "opacity-0"
                                                                                )}
                                                                            />
                                                                            {option.label}
                                                                        </CommandItem>
                                                                    ))
                                                                )
                                                            }
                                                            return null
                                                        })()}

                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                )}
                            />
                        </div>
                    )}

                    <FormLabel className="mr-2 mt-4 block">Options</FormLabel>
                    {form.watch(`deptFields.${currIdx}.options`)?.find(x => x.label === form.watch(`deptFields.${currIdx}.linkedFieldValues`))?.value.map((nestedOption, nestedIndex) => (
                        <div key={nestedIndex} className="flex items-center mb-2">
                            <Input
                                placeholder="Nested Value"
                                className="mr-2"
                                value={nestedOption.label}
                                onChange={(e) => {
                                    const value = e.target.value
                                    const options = form.getValues(`deptFields.${currIdx}.options`)
                                    const optionIndex = options.findIndex(x => x.label === form.getValues(`deptFields.${currIdx}.linkedFieldValues`))
                                    options[optionIndex].value[nestedIndex] = { label: value, value }
                                    form.setValue(`deptFields.${currIdx}.options`, options)
                                }}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                    const options = form.getValues(`deptFields.${currIdx}.options`)
                                    const optionIndex = options.findIndex(x => x.label === form.getValues(`deptFields.${currIdx}.linkedFieldValues`))
                                    options[optionIndex].value.splice(nestedIndex, 1)
                                    form.setValue(`deptFields.${currIdx}.options`, options)
                                }}
                            >
                                <X size={20} color="red" />
                            </Button>
                        </div>
                    ))}
                    {form.watch(`deptFields.${currIdx}.linkedFieldValues`) && (
                        <Button
                            type="button"
                            onClick={() => {
                                const options = form.getValues(`deptFields.${currIdx}.options`)
                                const optionIndex = options.findIndex(x => x.label === form.getValues(`deptFields.${currIdx}.linkedFieldValues`))
                                options[optionIndex].value.push({ label: '', value: '' })
                                form.setValue(`deptFields.${currIdx}.options`, options)
                            }}
                            className="mt-2 bg-blue-500 text-white"
                        >
                            <PlusIcon size={15} />
                            Add Nested Option
                        </Button>
                    )}
                </div>
            )
        }

        return null
    }, [currIdx, form, filteredDeptFields])

    return (
        <Form {...form}>
            <Card className="grid grid-cols-3 gap-2">
                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle className="text-2xl text-center font-bold">Form Builder  {filteredDeptFields[0]?.name || ''}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            {fields.map((field, index) => (
                                <div
                                    key={field.id}
                                    className={`mb-4 border p-4 rounded-md ${currIdx === index ? 'bg-blue-50' : ''}`}
                                    onClick={() => setCurrIdx(index)}
                                >
                                    <div className="grid grid-cols-8 gap-2">
                                        <div className="col-span-3">
                                            <FormField
                                                control={form.control}
                                                name={`deptFields.${index}.name`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input
                                                                className="bg-zinc-100/50 border-0 dark:bg-zinc-700 dark:text-white focus-visible:ring-slate-500 focus-visible:ring-1 text-black focus-visible:ring-offset-0"
                                                                placeholder="Field Name"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="col-span-3">
                                            <FormField
                                                control={form.control}
                                                name={`deptFields.${index}.fieldType`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <Select
                                                            onValueChange={(value) => {
                                                                field.onChange(value)
                                                                handleSelectChange(value, index)
                                                                form.trigger()
                                                                setCurrIdx(index)
                                                            }}
                                                            value={field.value || ""}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger className="bg-zinc-100/50 border-0 dark:bg-zinc-700 dark:text-white focus-visible:ring-slate-500 focus-visible:ring-1 text-black focus-visible:ring-offset-0">
                                                                    <SelectValue placeholder="Select Field Type" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent className="bg-zinc-100 border-0 dark:bg-zinc-700 dark:text-white focus-visible:ring-slate-500 focus-visible:ring-1 text-black focus-visible:ring-offset-0">
                                                                {fieldTypes.map(type => (
                                                                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>

                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="flex gap-2 col-span-2">
                                            <Button
                                                type="button"
                                                variant="default"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    moveField(index, -1)
                                                }}
                                                disabled={index === 0}
                                            >
                                                <ArrowUp size={15} />
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="default"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    moveField(index, 1)
                                                }}
                                                disabled={index === fields.length - 1}
                                            >
                                                <ArrowDown size={15} />
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    remove(index)
                                                }}
                                            >
                                                <X color="red" size={20} />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex gap-8 mt-2">
                                        <FormField
                                            control={form.control}
                                            name={`deptFields.${index}.isRequired`}
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                    <FormLabel className="font-normal">Required</FormLabel>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`deptFields.${index}.isDisabled`}
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                    <FormLabel className="font-normal">Disabled</FormLabel>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            ))}
                            <Button
                                type="button"
                                onClick={() => append({ name: '', fieldType: '', order: fields.length + 1, isRequired: true, isDisabled: false, ddOptionId: null })}
                                className="mt-4 bg-blue-500 text-white"
                            >
                                Add Field
                            </Button>
                            <div className="mt-6 flex justify-end">
                                <Button type="button" className="mr-2 bg-gray-500 text-white">Cancel</Button>
                                <Button type="submit" variant="default" className="text-white">Submit</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle className="text-2xl text-center font-bold">Field Options</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {renderFieldOptions()}
                    </CardContent>
                </Card>
            </Card>
        </Form>
    )
}

export default UpdateDepartmentFieldsModal