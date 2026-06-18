import { BillWithDetailsType } from "./types";
import { numberToWords } from "./utils";

export function getMaintenanceBillHTML(
    bill: BillWithDetailsType,
    society_name: string,
    reg_no: string,
    address: string,
    start_date: string,
    end_date: string,
) {

    // Organize charges
    const charges: { name: string; amount: number }[] = [];
    if (bill.bill_details) {
        bill.bill_details.forEach(c => {
            charges.push({ name: c.bd_bill_item, amount: Number(c.bd_bill_amount) });
        });
    }

    // Sort charges: Maintenance -> Sinking -> Parking -> Others
    const priorityOrder = ["General Maintenance Charges", "Sinking Fund", "Parking Charges"];

    // Helper to find index or return Infinity if not found
    const getPriority = (name: string) => {
        const index = priorityOrder.findIndex(p => name.toLowerCase().includes(p.toLowerCase())); // Simple loose matching
        return index !== -1 ? index : Infinity;
    };

    charges.sort((a, b) => {
        const pA = getPriority(a.name);
        const pB = getPriority(b.name);
        if (pA !== pB) return pA - pB;
        return a.name.localeCompare(b.name);
    });

    let chargesHtml = ``;
    let srNo = 1;
    charges.forEach(charge => {
        if (charge.amount <= 0) return;
        chargesHtml += `
            <tr>
                <td>${srNo}</td>
                <td>${charge.name}</td>
                <td class="amount-col">${charge.amount.toFixed(2)}</td>
            </tr>
        `;
        srNo++;
    });

    // Totals
    const subTotal = Number(bill.bm_bill_sub_total);
    const grandTotal = Number(bill.bm_bill_total);
    // Calculate interest: Total - SubTotal - GST - Arrears
    // Ensure we handle potential float precision issues
    const gst = Number(bill.bm_bill_gst);
    const arrears = Number(bill.bm_bill_arrers);
    const calculatedInterest = grandTotal - subTotal - gst - arrears;
    const interest = calculatedInterest > 0.01 ? calculatedInterest : 0;

    let receiptsHtml = ``;
    if (bill.bill_receipts && bill.bill_receipts.length > 0) {
        bill.bill_receipts.forEach((receipt, index) => {
            receiptsHtml += `
            <tr>
                <td>${index + 1}</td>
                <td>${new Date(receipt.txn_date).toLocaleDateString("en-IN")}</td>
                <td>${receipt.txn_voucher_no}</td>
                <td>${receipt.txn_payment_type}</td>
                <td>${receipt.txn_chq_no || "-"}</td>
                <td class="amount-col">${Number(receipt.txn_amount).toFixed(2)}</td>
            </tr>`;
        });
    }

    const receiptsSection = (bill.bill_receipts && bill.bill_receipts.length > 0) ? `
        <div style="margin-top: 20px;">
            <hr style="border: 1px dashed #ccc; margin-bottom: 15px;" />
            <h3 style="font-size: 14px; font-weight: bold; margin-bottom: 10px; text-transform: uppercase;">
                Receipts for payment for the bills of previous quarter
            </h3>
            <table class="charges-table">
                <tr>
                    <th width="5%">Sr.</th>
                    <th width="15%">Date</th>
                    <th width="15%">Voucher No</th>
                    <th width="15%">Mode</th>
                    <th width="30%">Cheque/Ref No</th>
                    <th class="amount-col">Amount (₹)</th>
                </tr>
                ${receiptsHtml}
            </table>
        </div>
    ` : "";

    const printContents = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Maintenance Bill</title>
                <style>
                    .body {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                        font-family: Arial, sans-serif;
                        font-size: 12px;
                        line-height: 1.2;
                        padding: 10px;
                        background-color: #f5f5f5;
                    }
                    
                    .bill-container {
                        width: 100%;
                        max-width: 700px;
                        margin: 0 auto;
                        background: white;
                        padding: 15px;
                        page-break-after: always;
                    }
                    
                    .header {
                        text-align: center;
                        margin-bottom: 12px;
                        border-bottom: 1px solid #333;
                        padding-bottom: 8px;
                    }
                    
                    .header h1 {
                        font-size: 16px;
                        font-weight: bold;
                        margin-bottom: 3px;
                        text-transform: uppercase;
                    }
                    
                    .header p {
                        font-size: 11px;
                        margin-bottom: 2px;
                    }
                    
                    .info-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 10px;
                        font-size: 12px;
                    }
                    
                    .info-table td {
                        padding: 3px;
                        vertical-align: top;
                    }
                    
                    .info-table tr:nth-child(even) {
                        background-color: #f9f9f9;
                    }
                    
                    .details-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 12px;
                        font-size: 11px;
                    }
                    
                    .details-table td {
                        padding: 3px;
                    }
                    
                    .charges-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 12px;
                        font-size: 11px;
                    }
                    
                    .charges-table th, .charges-table td {
                        border: 1px solid #ddd;
                        padding: 4px;
                    }
                    
                    .charges-table th {
                        background-color: #f2f2f2;
                        text-align: left;
                    }
                    
                    .amount-col {
                        text-align: right;
                        width: 20%;
                    }
                    
                    .total-section {
                        margin-bottom: 12px;
                    }
                    
                    .total-section table {
                        width: 100%;
                        border-collapse: collapse;
                        font-size: 11px;
                    }
                    
                    .total-section td {
                        padding: 3px 5px;
                    }
                    
                    .amount-row {
                        border-top: 1px solid #ddd;
                        font-weight: bold;
                    }
                    
                    .notes {
                        margin-bottom: 12px;
                        font-size: 10px;
                        color: #555;
                    }
                    
                    .notes ol {
                        margin-left: 15px;
                    }
                    
                    .notes li {
                        margin-bottom: 3px;
                    }
                    
                    .payment-section {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 10px;
                        font-size: 11px;
                    }
                    
                    .payment-section td {
                        padding: 5px;
                        vertical-align: top;
                        border: 1px solid #ddd;
                    }
                    
                    .highlight {
                        font-weight: bold;
                        background-color: #f9f9f9;
                        font-size: 11px;
                        padding: 3px 0;
                    }
                    
                    .text-right {
                        text-align: right;
                    }
                    
                    .signatory {
                        margin-top: 40px;
                        text-align: right;
                    }
                    
                    .compact {
                        margin-bottom: 5px;
                    }
                </style>
            </head>
            <body class="body">
                <div class="bill-container">
                    <div class="header">
                        <h1>${society_name}</h1>
                        ${reg_no.length > 0 ? `<p><strong>Regn. No.</strong> ${reg_no}</p>` : ""}
                        <p><strong>${address}</strong></p>
                    </div>
                    
                    <table class="info-table">
                        <tr>
                            <td width="12%"><strong>Unit No</strong></td>
                            <td width="15%">${bill.bm_flat_no}</td>
                            <td width="12%"><strong>Unit Area</strong></td>
                            <td width="15%">${bill.bm_flat_area} sq.ft.</td>
                            <td width="15%"><strong>Bill No.</strong></td>
                            <td width="31%">${bill.bm_bill_no}</td>
                        </tr>
                        <tr>
                            <td><strong>Name</strong></td>
                            <td colspan="3">${bill.owner_name || "&nbsp;"}</td>
                            <td><strong>Bill Date</strong></td>
                            <td>${new Date().toLocaleDateString('en-IN')}</td>
                        </tr>
                        <tr>
                            <td><strong>Ownership</strong></td>
                            <td>${bill.bm_owner_tennant === 'O' ? 'Owner' : 'Tenant'}</td>
                            <td></td>
                            <td></td>
                            <td><strong>Due Date</strong></td>
                            <td>${bill.bm_due_date ? new Date(bill.bm_due_date).toLocaleDateString('en-IN') : new Date(new Date().getTime() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN')}</td>
                        </tr>
                    </table>
                    
                    <table class="details-table">
                        <tr>
                            <td width="15%"><strong>Bill For</strong></td>
                            <td width="35%">${start_date} to ${end_date}</td>
                            <td width="15%"><strong>Parking</strong></td>
                            <td width="35%">${bill.bm_parking_yn === 'Y' ? "Yes" : "No"}</td>
                        </tr>
                        <tr>
                            <td colspan="2"></td>
                            <td colspan="2">
                                <div style="display: flex; gap: 20px;">
                                    <div><strong>4-Wheeler:</strong> ${(bill as any).open_4w_count ?? 0} Open / ${(bill as any).self_4w_count ?? 0} Self</div>
                                    <div><strong>2-Wheeler:</strong> ${(bill as any).open_2w_count ?? 0} Open / ${(bill as any).self_2w_count ?? 0} Self</div>
                                </div>
                            </td>
                        </tr>
                    </table>
                    
                    <table class="charges-table">
                        <tr>
                            <th width="8%">Sr. No.</th>
                            <th width="72%">Particular of Charges</th>
                            <th class="amount-col">Amount (₹)</th>
                        </tr>
                        
                        ${chargesHtml}
                    </table>
                    
                    <div class="total-section">
                        <table>
                            <tr>
                                <td width="60%">E. & O.E</td>
                                <td width="20%"><strong>Sub Total</strong></td>
                                <td width="20%" class="text-right">${subTotal.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td rowspan="4" style="vertical-align: top;">
                                    <strong>${numberToWords(Number(grandTotal) || 0, { currency: true })}</strong>
                                </td>
                                <td>Adjustment Credit / Rebate</td>
                                <td class="text-right">0.00</td>
                            </tr>
                            <tr>
                                <td>Principal O/s (Arrears)</td>
                                <td class="text-right">${arrears > 0 ? arrears.toFixed(2) : "0.00"}</td>
                            </tr>
                            <tr>
                                <td>Interest on Arrears</td>
                                <td class="text-right">${interest > 0 ? interest.toFixed(2) : "0.00"}</td>
                            </tr>
                            <tr>
                                <td>GST</td>
                                <td class="text-right">${gst > 0 ? gst.toFixed(2) : "0.00"}</td>
                            </tr>
                            <tr class="amount-row">
                                <td></td>
                                <td>Total Due Amount and Payable</td>
                                <td class="text-right">${grandTotal > 0 ? grandTotal.toFixed(2) : "0.00"}</td>
                            </tr>
                        </table>
                    </div>
                    
                    <div class="notes">
                        <p><strong>Notes :</strong></p>
                        <ol>
                            <li>Interest @18% per annum will be charged after due date. Parking Charges are going to be revised and arrears will be collected in next quarter.</li>
                            <li>This is system generated bill and does not require signature.</li>
                            <li>Non-Occupancy Charges are added for last quarter and current quarter for tenant flats.</li>
                            <li>Bills are quarterly given. Members are given option to pay on Monthly Basis before due date. Monthly due date is 15th of every month. Interest will be charged after Bill Due Date if not paid.</li>
                        </ol>
                    </div>
                    
                    <div class="highlight">
                        <h3>Please pay online and send screen shots on same day</h3>
                    </div>
                    
                    <p class="compact">For ${society_name}</p>
                    
                    <table class="payment-section">
                        <tr>
                            <td width="50%">
                                <strong>Online Payment Option</strong><br>
                                Bank Name : State Bank of India<br>
                                Acc. No. : 38920152560<br>
                                IFSC Code : SBIN0070533
                            </td>
                            <td class="signatory">
                                Authorised Signatory
                            </td>
                        </tr>
                    </table>

                    ${receiptsSection}
                </div>
            </body>
            </html>
        `;

    return printContents;
}