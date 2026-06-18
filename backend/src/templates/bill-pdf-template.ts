import { ToWords } from 'to-words';

const toWords = new ToWords({
    localeCode: 'en-IN',
    converterOptions: {
        currency: true,
        ignoreDecimal: false,
        ignoreZeroCurrency: false,
        doNotAddOnly: false,
        currencyOptions: {
            name: 'Rupee',
            plural: 'Rupees',
            symbol: '₹',
            fractionalUnit: {
                name: 'Paisa',
                plural: 'Paise',
                symbol: '',
            },
        },
    },
});

export function getMaintenanceBillHTML(
    bill: any,
    society_name: string,
    reg_no: string,
    address: string,
    start_date: string,
    end_date: string,
) {

    // Organize charges
    const charges: { name: string; amount: number }[] = [];
    if (bill.bill_details) {
        bill.bill_details.forEach((c: any) => {
            charges.push({ name: c.bd_bill_item, amount: Number(c.bd_bill_amount) });
        });
    }

    // Sort charges: Maintenance -> Sinking -> Parking -> Others
    const priorityOrder = ["General Maintenance Charges", "Sinking Fund", "Parking Charges"];

    const getPriority = (name: string) => {
        const index = priorityOrder.findIndex(p => name.toLowerCase().includes(p.toLowerCase()));
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

    const subTotal = Number(bill.bm_bill_sub_total);
    const grandTotal = Number(bill.bm_bill_total);
    const gst = Number(bill.bm_bill_gst);
    const arrears = Number(bill.bm_bill_arrers);
    const calculatedInterest = grandTotal - subTotal - gst - arrears;
    const interest = calculatedInterest > 0.01 ? calculatedInterest : 0;

    let receiptsHtml = ``;
    if (bill.bill_receipts && bill.bill_receipts.length > 0) {
        bill.bill_receipts.forEach((receipt: any, index: number) => {
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

    return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <style>
                    body {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                        font-family: 'Segoe UI', Arial, sans-serif;
                        font-size: 11px;
                        line-height: 1.3;
                        padding: 20px;
                        background-color: white;
                    }
                    
                    .bill-container {
                        width: 100%;
                        max-width: 800px;
                        margin: 0 auto;
                    }
                    
                    .header {
                        text-align: center;
                        margin-bottom: 15px;
                        border-bottom: 2px solid #000;
                        padding-bottom: 10px;
                    }
                    
                    .header h1 {
                        font-size: 20px;
                        font-weight: bold;
                        margin: 0 0 5px 0;
                        text-transform: uppercase;
                    }
                    
                    .header p {
                        font-size: 12px;
                        margin: 2px 0;
                    }
                    
                    .info-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 15px;
                    }
                    
                    .info-table td {
                        padding: 4px;
                        vertical-align: top;
                        border: 1px solid #eee;
                    }
                    
                    .charges-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 20px;
                    }
                    
                    .charges-table th, .charges-table td {
                        border: 1px solid #ddd;
                        padding: 6px;
                    }
                    
                    .charges-table th {
                        background-color: #f8f9fa;
                        text-align: left;
                        font-weight: bold;
                    }
                    
                    .amount-col {
                        text-align: right;
                    }
                    
                    .total-section table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    
                    .total-section td {
                        padding: 4px 8px;
                        border: 1px solid #eee;
                    }
                    
                    .amount-row {
                        background-color: #f8f9fa;
                        font-weight: bold;
                        font-size: 13px;
                    }
                    
                    .notes {
                        margin-top: 20px;
                        font-size: 10px;
                        color: #444;
                        border: 1px solid #eee;
                        padding: 10px;
                        border-radius: 4px;
                    }
                    
                    .payment-section {
                        width: 100%;
                        margin-top: 20px;
                        border-top: 2px solid #000;
                        padding-top: 15px;
                    }
                    
                    .highlight {
                        background-color: #000;
                        color: #fff;
                        padding: 8px;
                        text-align: center;
                        font-weight: bold;
                        margin: 15px 0;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                    }
                    
                    @media print {
                        body { padding: 0; }
                        .bill-container { border: none; }
                    }
                </style>
            </head>
            <body>
                <div class="bill-container">
                    <div class="header">
                        <h1>${society_name}</h1>
                        ${reg_no.length > 0 ? `<p><strong>Registration No:</strong> ${reg_no}</p>` : ""}
                        <p>${address}</p>
                    </div>
                    
                    <table class="info-table">
                        <tr>
                            <td width="15%"><strong>Flat No:</strong></td>
                            <td width="35%">${bill.bm_flat_no}</td>
                            <td width="15%"><strong>Bill No:</strong></td>
                            <td width="35%">${bill.bm_bill_no}</td>
                        </tr>
                        <tr>
                            <td><strong>Name:</strong></td>
                            <td>${bill.owner_name || "-"}</td>
                            <td><strong>Bill Date:</strong></td>
                            <td>${new Date().toLocaleDateString('en-IN')}</td>
                        </tr>
                        <tr>
                            <td><strong>Area:</strong></td>
                            <td>${bill.bm_flat_area} sq.ft.</td>
                            <td><strong>Due Date:</strong></td>
                            <td>${bill.bm_due_date ? new Date(bill.bm_due_date).toLocaleDateString('en-IN') : "-"}</td>
                        </tr>
                        <tr>
                            <td><strong>Bill For:</strong></td>
                            <td>${start_date} to ${end_date}</td>
                            <td><strong>Ownership:</strong></td>
                            <td>${bill.bm_owner_tennant === 'O' ? 'Owner' : 'Tenant'}</td>
                        </tr>
                    </table>
                    
                    <table class="charges-table">
                        <thead>
                            <tr>
                                <th width="10%">Sr. No.</th>
                                <th width="65%">Particulars</th>
                                <th width="25%" class="amount-col">Amount (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${chargesHtml}
                        </tbody>
                    </table>
                    
                    <div class="total-section">
                        <table>
                            <tr>
                                <td width="65%" rowspan="5" style="vertical-align: middle; background-color: #fafafa; padding: 20px;">
                                    <div style="font-size: 10px; color: #888; margin-bottom: 5px; text-transform: uppercase; font-weight: bold;">Amount in Words</div>
                                    <div style="font-size: 14px; font-weight: bold; color: #000;">${toWords.convert(Number(grandTotal) || 0)}</div>
                                </td>
                                <td width="15%">Sub Total</td>
                                <td width="20%" class="amount-col">${subTotal.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td>Arrears</td>
                                <td class="amount-col">${arrears > 0 ? arrears.toFixed(2) : "0.00"}</td>
                            </tr>
                            <tr>
                                <td>Interest</td>
                                <td class="amount-col">${interest > 0 ? interest.toFixed(2) : "0.00"}</td>
                            </tr>
                            <tr>
                                <td>GST</td>
                                <td class="amount-col">${gst > 0 ? gst.toFixed(2) : "0.00"}</td>
                            </tr>
                            <tr class="amount-row">
                                <td>Grand Total</td>
                                <td class="amount-col">₹ ${grandTotal.toFixed(2)}</td>
                            </tr>
                        </table>
                    </div>
                    
                    <div class="highlight">
                        Please pay online to avoid late fees
                    </div>
                    
                    <div class="payment-section">
                        <table style="width: 100%; border: none;">
                            <tr style="border: none;">
                                <td style="border: none; width: 60%;">
                                    <strong>Bank Details:</strong><br/>
                                    Account Name: ${society_name}<br/>
                                    Bank: State Bank of India<br/>
                                    Account: 38920152560 | IFSC: SBIN0070533
                                </td>
                                <td style="border: none; width: 40%; text-align: right; vertical-align: bottom;">
                                    <br/><br/>
                                    <strong>Authorised Signatory</strong>
                                </td>
                            </tr>
                        </table>
                    </div>

                    ${receiptsSection}

                    <div class="notes">
                        <strong>Notes:</strong>
                        <ol>
                            <li>Interest @18% p.a. will be charged after the due date.</li>
                            <li>This is a computer-generated document and does not require a physical signature.</li>
                            <li>Please ignore if already paid.</li>
                        </ol>
                    </div>
                </div>
            </body>
            </html>
        `;
}
