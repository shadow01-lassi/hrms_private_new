import { pool, withTransaction } from "../lib/db";

export const getSidebarFromRole = async (role: number, accessType: string) => {
    const access_type = accessType === "AD" ? "AD" : accessType === "SA" ? "SA" : "US";
    const query = `
        SELECT *
        FROM menu_master m
        WHERE m.mm_pm_id IS NULL
            OR m.mm_pm_id IN (
                SELECT rp_pm_id
                FROM role_permissions
                WHERE rp_rm_id = $1
            )
            AND m.mm_access_type = $2
        ORDER BY m.mm_order, m.mm_id;
    `;
    const { rows } = await pool.query(query, [role, access_type]);
    return rows || [];
};

export const getSidebarTreeView = async () => {
    const query = `
        WITH RECURSIVE menu_hierarchy AS (
            -- Base case: Select all rows with parent = null
            SELECT 
                mm_id AS id,
                mm_name AS name,
                mm_parent_id AS parent,
                mm_pm_id AS pm_id,
                ARRAY[]::INTEGER[] AS children
            FROM menu_master
            WHERE mm_parent_id IS NULL

            UNION ALL

            -- Recursive case: Join child rows with parent rows
            SELECT 
                child.mm_id AS id,
                child.mm_name AS name,
                child.mm_parent_id AS parent,
                child.mm_pm_id AS pm_id,
                ARRAY[]::INTEGER[] AS children
            FROM menu_master child
            INNER JOIN menu_hierarchy parent ON child.mm_parent_id = parent.id
        ),
        menu_with_children AS (
            -- Aggregate children for each parent
            SELECT 
                parent.id,
                parent.name,
                parent.parent,
                parent.pm_id,
                ARRAY_AGG(child.mm_id ORDER BY child.mm_id ASC) AS children
            FROM menu_hierarchy parent
            LEFT JOIN menu_master child ON parent.id = child.mm_parent_id
            GROUP BY parent.id, parent.name, parent.parent, parent.pm_id
        ),
        root_with_virtual_parent AS (
            -- Create a virtual root row with id: 0 and children as all null-parent ids
            SELECT 
                0 AS id,
                '' AS name,
                NULL AS parent,
                NULL AS pm_id,
                ARRAY_AGG(id ORDER BY id ASC) AS children
            FROM menu_with_children
            WHERE parent IS NULL

            UNION ALL

            -- Update parent = 0 for all rows that previously had parent = null
            SELECT 
                id,
                name,
                CASE WHEN parent IS NULL THEN 0 ELSE parent END AS parent,
                pm_id,
                children
            FROM menu_with_children
        )
        -- Final output
        SELECT 
            id,
            name,
            COALESCE(children, ARRAY[]::INTEGER[]) AS children,
            parent,
            pm_id
        FROM root_with_virtual_parent
        ORDER BY id;
    `;
    const { rows } = await pool.query(query);
    if (rows) {
        return rows.map((item) => ({
            ...item,
            children: item.children && item.children[0] === null ? [] : item.children,
        }));
    }
    return [];
};

export const getAllMenuItemsDAO = async () => {
    const query = `
        SELECT *
        FROM menu_master
        ORDER BY mm_order ASC, mm_id ASC;
    `;
    const { rows } = await pool.query(query);
    return rows || [];
};

export const createMenuItemDAO = async (data: any) => {
    const query = `
        INSERT INTO menu_master (
            mm_name, mm_parent_id, mm_label, mm_access_type, mm_cm_id, mm_pm_id, mm_link, mm_icon, mm_order
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *;
    `;
    const { rows } = await pool.query(query, [
        data.mm_name,
        data.mm_parent_id || null,
        data.mm_label || null,
        data.mm_access_type || "AD",
        data.mm_cm_id || null,
        data.mm_pm_id || null,
        data.mm_link || null,
        data.mm_icon || null,
        data.mm_order || 0
    ]);
    return rows[0];
};

export const updateMenuItemDAO = async (id: number, data: any) => {
    const query = `
        UPDATE menu_master SET
            mm_name = $1,
            mm_parent_id = $2,
            mm_label = $3,
            mm_access_type = $4,
            mm_cm_id = $5,
            mm_pm_id = $6,
            mm_link = $7,
            mm_icon = $8,
            mm_order = $9
        WHERE mm_id = $10
        RETURNING *;
    `;
    const { rows } = await pool.query(query, [
        data.mm_name,
        data.mm_parent_id || null,
        data.mm_label || null,
        data.mm_access_type || "AD",
        data.mm_cm_id || null,
        data.mm_pm_id || null,
        data.mm_link || null,
        data.mm_icon || null,
        data.mm_order || 0,
        id
    ]);
    return rows[0];
};

export const deleteMenuItemDAO = async (id: number) => {
    const query = `DELETE FROM menu_master WHERE mm_id = $1 RETURNING *;`;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
};

export const updateMenuOrderDAO = async (orders: { id: number; order: number }[]) => {
    return withTransaction(async (client) => {
        for (const item of orders) {
            await client.query(
                `UPDATE menu_master SET mm_order = $1 WHERE mm_id = $2`,
                [item.order, item.id]
            );
        }
        return true;
    });
};