// importing client
import api from "@/lib/api";

// importing from react
import { useEffect, useState } from "react";

// importing components
import { DocTypeForm } from "./doc-type.form";

// importing session, constants and others
import { DocTypeMasterType } from "@/lib/types";
import { useParams } from "react-router-dom";

export default function EditDocTypePage() {
    const params = useParams();
    const { id } = params;

    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<DocTypeMasterType | null>(null);

    useEffect(() => {
        getData();
    }, []);

    async function getData() {
        setLoading(true);
        try {
            const response = await api.get(`/master/doc-types`, {
                params: {
                    dt_id: id,
                },
            });
            if (response.data.type === "success") {
                setData(response.data.data[0]);
            }
        } catch (error) {
            console.error("Error fetching doc type data:", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <div className="space-y-6">
                <h1 className="heading">
                    Edit Document Type
                </h1>

                {loading ? (
                    <>
                        Loading...
                    </>
                ) : (
                    data && (
                        <DocTypeForm
                            action="edit"
                            prepopulatedData={data}
                        />
                    )
                )}
            </div>
        </>
    );
}