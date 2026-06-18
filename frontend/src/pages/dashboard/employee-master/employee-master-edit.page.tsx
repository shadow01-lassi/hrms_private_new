import api from "@/lib/api";
import { useEffect, useState } from "react";
import { EmployeeMasterForm } from "./employee-master.form";
import { EmployeeMasterType } from "@/lib/types";
import { useParams } from "react-router-dom";

export default function EmployeeMasterEditPage() {
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<EmployeeMasterType | null>(null);

    useEffect(() => {
        if (id) {
            getData();
        }
    }, [id]);

    async function getData() {
        setLoading(true);
        try {
            const response = await api.get(`/master/employees/${id}`);
            if (response.data.type === "success") {
                setData(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching employee data:", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            <h1 className="heading">Edit Employee</h1>
            {loading ? (
                <div>Loading...</div>
            ) : (
                data && <EmployeeMasterForm action="edit" prepopulatedData={data} />
            )}
        </div>
    );
}
