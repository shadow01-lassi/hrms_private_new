// importing from react
import { Link } from "react-router-dom";

// importing shadcn components
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import slugify from "slugify";

// importing icons
import { Calendar, Heart, Eye, Share2, MessageCircleMore } from "lucide-react";

// importing types, utilities and others
import type { Blogs } from "@/lib/types";
import { formatDateReverse } from "@/lib/utils";

export function BlogCard({
    blog,
    view
}: {
    blog: Blogs;
    view?: string;
}) {
    return (
        <>
            <Link
                to={`/jobs/${slugify(blog.title, { lower: true, strict: true })}`}
                state={{ blogId: blog.id }}
                className="border border-background hover:border-border/60 rounded-2xl pb-2 bg-secondary/60 hover:bg-muted/40 w-full"
            >
                <div key={blog.id} className={`${view === "list" ? "flex" : "block"}`}>
                    <CardHeader>
                        <img
                            src={blog.cover_image}
                            alt={blog.slug}
                            className="aspect-video object-cover rounded-lg hover:shadow-md bg-background w-sm"
                        />
                    </CardHeader>

                    <div className={`${view === "list" ? "p-6" : ""}`}>
                        <CardContent className="mt-auto">
                            <CardTitle className="group-hover:text-primary transition-colors text-lg">
                                {blog.title}
                            </CardTitle>

                            <CardDescription className="line-clamp-2">
                                {blog.description}
                            </CardDescription>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                                <Calendar className="h-3 w-3" />
                                Posted On
                                &nbsp;
                                {formatDateReverse(new Date(blog.updated_at))}
                            </div>
                            <div className="flex gap-2">
                                <Badge variant="outline" className="bg-muted">{blog.category_name || "-"}</Badge>
                                <Badge variant="outline" className="bg-accent">{blog.subcategory_name || "-"}</Badge>
                            </div>
                        </CardContent>

                        <CardFooter className="flex justify-between pb-0">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <MessageCircleMore className="h-4 w-4" />
                                    {blog.comment_count}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Eye className="h-4 w-4" />
                                    {blog.view_count}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Heart className="h-4 w-4" />
                                    {blog.reaction_count}
                                </span>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Share2 className="h-4 w-4" />
                            </Button>
                        </CardFooter>
                    </div>
                </div>
            </Link>
        </>
    );
}