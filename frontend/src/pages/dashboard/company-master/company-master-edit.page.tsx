import api from "@/lib/api";
import { useEffect, useState } from "react";
import { CompanyMasterForm } from "./company-master.form";
import { CompanyMasterType } from "@/lib/types";
import { useParams } from "react-router-dom";

export default function CompanyMasterEditPage() {
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<CompanyMasterType | null>(null);

    useEffect(() => {
        if (id) {
            getData();
        }
    }, [id]);

    async function getData() {
        setLoading(true);
        try {
            const response = await api.get(`/master/company-master/${id}`);
            if (response.data.type === "success") {
                setData(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching company data:", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            <h1 className="heading">Edit Company</h1>
            {loading ? (
                <div>Loading...</div>
            ) : (
                data && <CompanyMasterForm action="edit" prepopulatedData={data} />
            )}
        </div>
    );
}
