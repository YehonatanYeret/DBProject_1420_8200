import csv


def update_lab_codes(research_file, reference_file, output_file):
    """
    Reads the research CSV file (with the correct LAB_CODE) and a reference CSV file,
    and updates the LAB_CODE in the reference file with the one from the research file.
    The update is done row by row, assuming both files have the same number of rows.
    The updated data is written to a new output CSV file.
    """
    updated_rows = []

    # Open both CSV files simultaneously
    with open(research_file, 'r', encoding='utf-8') as research_csv, \
            open(reference_file, 'r', encoding='utf-8') as ref_csv:
        research_reader = csv.DictReader(research_csv)
        ref_reader = csv.DictReader(ref_csv)

        # Use the fieldnames from the reference file for output
        fieldnames = research_reader.fieldnames

        # Iterate over both CSV files in parallel
        for research_row, ref_row in zip(research_reader, ref_reader):
            # Replace the LAB_CODE in the reference row with the one from the research row
            research_row['medication_code'] = ref_row['medication_code']
            updated_rows.append(research_row)

    # Write the updated rows to the output CSV file
    with open(output_file, 'w', newline='', encoding='utf-8') as out_csv:
        writer = csv.DictWriter(out_csv, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(updated_rows)


if __name__ == '__main__':
    # File with the correct lab codes
    research_file = 'DATA/treatment_medication_data.csv'
    # File with the incomplete lab code references
    reference_file = 'DATA/medication_data.csv'
    # Output file where the updated reference data will be saved
    output_file = 'REFERENCE_updated.csv'

    update_lab_codes(research_file, reference_file, output_file)
    print(f"Updated LAB_CODE in {reference_file} using {research_file} and saved to {output_file}")
