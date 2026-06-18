// importing from react
import { useState, useEffect } from "react";

// importing components
import { BlogCard } from "@/components/blogs/blog-card";
import { Blogs } from "@/lib/types";
import { BlogLoading } from "./blog-loading";
import api from "@/lib/api";

export function BlogsHome() {
    const [blogs, setBlogs] = useState<Blogs[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchBlogs = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/user/blogs?page=1&limit=6`);
                if (response.status === 200) {
                    setBlogs(response.data.blogs);
                }
            } catch (error) {
                console.error("Error fetching blogs:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBlogs();
    }, []);

    return (
        <>
            <div>
                <div className={"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"}>
                    {loading ? (
                        <>
                            {[1, 2, 3, 4, 5, 6].map((_, index) => (
                                <BlogLoading key={index} />
                            ))}
                        </>
                    ) : (
                        <>
                            {blogs.map((blog) => (
                                <BlogCard blog={blog} />
                            ))}
                        </>
                    )}
                </div>
            </div>
        </>
    );
}