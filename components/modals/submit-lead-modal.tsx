"use client"
import { useForm } from "react-hook-form"

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    FileUploader,
    FileUploaderContent,
    FileUploaderItem,
    FileInput,
} from "@/components/file-uploader";

import { useToast } from "@/components/ui/use-toast"
import { useMutation } from "graphql-hooks"
import { useAtomValue } from "jotai"
import { userAtom } from "@/lib/atom/userAtom"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { leadMutation } from "@/lib/graphql/lead/mutation"
import { formatFormData } from "@/lib/utils"
import { useModal } from "@/hooks/use-modal-store"
import { DropzoneOptions } from "react-dropzone"
import { useState } from "react"
import Image from "next/image"

export const SubmitLeadModal = () => {

    const user = useAtomValue(userAtom)
    const { toast } = useToast()

    const [files, setFiles] = useState<File[] | null>([]);

    const dropzone = {
        accept: {
            "image/*": [".jpg", ".jpeg", ".png"],
        },
        multiple: true,
        maxFiles: 4,
        maxSize: 1 * 1024 * 1024,
    } satisfies DropzoneOptions;


    const { isOpen, onClose, type, data: modalData } = useModal();
    const { lead, fields } = modalData;

    const isModalOpen = isOpen && type === "submitLead";

    const [submitFeedback, { loading: feedBackLoading }] = useMutation(leadMutation.SUBMIT_LEAD);

    const form = useForm<any>({
        // resolver: zodResolver(submitFeedbackSchema),
    })

    const { formState: { errors } } = form

    const onSubmit = async (data: any) => {
        let url = "";
        try {
            if (files?.length) {
                const formData = new FormData();
                files.forEach((file: File) => {
                    formData.append('files', file);
                });

                const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_GRAPHQL_API || 'http://localhost:8080'}/graphql/upload`, {
                    method: 'POST',
                    body: formData
                });

                const urls = await uploadRes.json();

                const { data: resData, loading, error } = await submitFeedback({
                    variables: {
                        deptId: user?.deptId,
                        leadId: lead?.id || "",
                        callStatus: "SUCCESS",
                        paymentStatus: "PENDING",
                        feedback: formatFormData(fields?.subDeptFields ?? [], data), // Pass URL if needed in feedback
                        urls,
                    },
                });

                if (error) {
                    const message = error?.graphQLErrors?.map((e: any) => e.message).join(", ");
                    toast({
                        title: 'Error',
                        description: message || "Something went wrong",
                        variant: "destructive"
                    });
                    return;
                }

                toast({
                    variant: "default",
                    title: "Lead Submitted Successfully!",
                });
                handleClose();
            } else {
                // No files to upload, directly proceed with GraphQL mutation
                const { data: resData, loading, error } = await submitFeedback({
                    variables: {
                        deptId: user?.deptId,
                        leadId: lead?.id || "",
                        callStatus: "SUCCESS",
                        paymentStatus: "PENDING",
                        feedback: formatFormData(fields?.subDeptFields ?? [], data),
                    },
                });

                if (error) {
                    const message = error?.graphQLErrors?.map((e: any) => e.message).join(", ");
                    toast({
                        title: 'Error',
                        description: message || "Something went wrong",
                        variant: "destructive"
                    });
                    return;
                }

                toast({
                    variant: "default",
                    title: "Lead Submitted Successfully!",
                });
                handleClose();
            }
        } catch (error) {
            console.error("Error during submission:", error);
            toast({
                title: 'Error',
                description: "Failed to submit lead feedback.",
                variant: "destructive"
            });
        }
    }

    const handleClose = () => {
        form.reset();
        onClose();
    }

    return (
        <Dialog open={isModalOpen} onOpenChange={handleClose}>
            <DialogContent className="text-black max-w-screen-sm">
                <DialogHeader className="pt-8 px-6">
                    <DialogTitle className="text-2xl text-center font-bold">
                        {fields?.name}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                        {fields?.subDeptFields.map((cfield: any) => {
                            if (cfield.fieldType === 'INPUT') {
                                return (
                                    <FormField
                                        key={cfield.id}
                                        control={form.control}
                                        name={cfield.name}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className=" font-semibold dark:text-secondary/70">{cfield.name}</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        className="bg-zinc-100/50 placeholder:capitalize border-0 dark:bg-zinc-700 dark:text-white focus-visible:ring-slate-500 focus-visible:ring-1 text-black focus-visible:ring-offset-0"
                                                        placeholder={cfield.name}
                                                        {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )
                            }
                            if (cfield.fieldType === 'SELECT') {
                                return (
                                    <FormField
                                        key={cfield.id}
                                        control={form.control}
                                        name={cfield.name}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue className="placeholder:capitalize" placeholder="Call Status" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="pending">pending</SelectItem>
                                                        <SelectItem value="busy">busy</SelectItem>
                                                        <SelectItem value="success">success</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                )
                            }
                            if (cfield.fieldType === 'RADIO') {
                                return (<FormField
                                    key={cfield.id}
                                    control={form.control}
                                    name={cfield.name}
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel>{cfield.name}</FormLabel>
                                            <FormControl>
                                                <RadioGroup
                                                    onValueChange={field.onChange}
                                                    defaultValue={cfield.value || "Yes"}
                                                    className="flex flex-col space-y-1"
                                                >
                                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                                        <FormControl>
                                                            <RadioGroupItem value="Yes" />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">
                                                            Yes
                                                        </FormLabel>
                                                    </FormItem>
                                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                                        <FormControl>
                                                            <RadioGroupItem value="No" />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">
                                                            No
                                                        </FormLabel>
                                                    </FormItem>
                                                </RadioGroup>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />)
                            }
                            if (cfield.fieldType === "IMAGE") {
                                return (
                                    <FileUploader
                                        key={cfield.id}
                                        value={files}
                                        onValueChange={setFiles}
                                        dropzoneOptions={dropzone}
                                    >
                                        <FileInput>
                                            <div className="flex items-center justify-center h-32 border bg-background rounded-md">
                                                <p className="text-gray-400">Drop files here</p>
                                            </div>
                                        </FileInput>
                                        <FileUploaderContent className="flex items-center flex-row gap-2">
                                            {files?.map((file, i) => (
                                                <FileUploaderItem
                                                    key={i}
                                                    index={i}
                                                    className="size-20 p-0 rounded-md overflow-hidden"
                                                    aria-roledescription={`file ${i + 1} containing ${file.name}`}
                                                >
                                                    <Image
                                                        src={URL.createObjectURL(file)}
                                                        alt={file.name}
                                                        height={80}
                                                        width={80}
                                                        className="size-20 p-0"
                                                    />
                                                </FileUploaderItem>
                                            ))}
                                        </FileUploaderContent>
                                    </FileUploader>
                                )
                            }
                        })}
                        <Button type="submit" className="mt-6">Submit Lead</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}