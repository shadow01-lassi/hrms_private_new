// importing shadcn components
import { Button } from "@/components/ui/button";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerTrigger,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";

// importing tyoes
import { Blogs } from "@/lib/types";

// importing icons
import { Eye, X } from "lucide-react";

export function BlogsDrawer({
    blog
}: {
    blog: Blogs
}) {
    return (
        <>
            <Drawer direction="right">
                <DrawerTrigger asChild>
                    <Button size={"sm"}>
                        <Eye /> View Job Posting
                    </Button>
                </DrawerTrigger>
                <DrawerContent className="min-w-[50vw] p-6 space-y-4">
                    <DrawerClose className="ml-auto">
                        <Button variant="outline"><X /></Button>
                    </DrawerClose>

                    <h1 className="sub-heading font-bold">
                        {blog.title}
                    </h1>

                    <ScrollArea className="max-h-[80vh] rounded-md border p-4">
                        <div dangerouslySetInnerHTML={{ __html: blog.content }}></div>
                    </ScrollArea>


                    <DrawerFooter>
                        <DrawerClose>
                            <Button variant="outline">Looks Fine</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>

        </>
    );
}