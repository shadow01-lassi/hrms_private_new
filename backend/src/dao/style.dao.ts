import { pool } from "../lib/db";

export interface IHostnameStyle {
    hs_hostname: string;
    hs_bg_color: string;
    hs_text_color: string;
    hs_primary_color: string;
    hs_app_name: string;
    hs_app_logo: string;
    hs_light_theme_colors: Record<string, string>;
    hs_dark_theme_colors: Record<string, string>;
    hs_last_updated_at?: Date;
}

export const getStyleByHostnameDAO = async (hostname: string) => {
    const query = `SELECT * FROM hostname_styles WHERE hs_hostname = $1 OR $1 LIKE '%' || hs_hostname || '%' ORDER BY LENGTH(hs_hostname) DESC LIMIT 1;`;
    const { rows } = await pool.query(query, [hostname]);
    return rows[0];
};

export const getAllStylesDAO = async () => {
    const query = `SELECT * FROM hostname_styles;`;
    const { rows } = await pool.query(query);
    return rows;
};

export const upsertStyleDAO = async (data: IHostnameStyle) => {
    const query = `
        INSERT INTO hostname_styles (
            hs_hostname, hs_bg_color, hs_text_color, hs_primary_color, 
            hs_app_name, hs_app_logo, hs_light_theme_colors, hs_dark_theme_colors
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (hs_hostname) DO UPDATE SET
            hs_bg_color = EXCLUDED.hs_bg_color,
            hs_text_color = EXCLUDED.hs_text_color,
            hs_primary_color = EXCLUDED.hs_primary_color,
            hs_app_name = EXCLUDED.hs_app_name,
            hs_app_logo = EXCLUDED.hs_app_logo,
            hs_light_theme_colors = EXCLUDED.hs_light_theme_colors,
            hs_dark_theme_colors = EXCLUDED.hs_dark_theme_colors,
            hs_last_updated_at = CURRENT_TIMESTAMP;
    `;

    const values = [
        data.hs_hostname,
        data.hs_bg_color,
        data.hs_text_color,
        data.hs_primary_color,
        data.hs_app_name,
        data.hs_app_logo,
        JSON.stringify(data.hs_light_theme_colors),
        JSON.stringify(data.hs_dark_theme_colors)
    ];

    await pool.query(query, values);
};
