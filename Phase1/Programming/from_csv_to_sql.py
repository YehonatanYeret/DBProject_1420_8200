import csv
import os


def csv_to_sql_insert(csv_filename, table_name, sql_filename):
    """
    Reads a CSV file and writes SQL INSERT commands to a new file.
    The first row in the CSV is assumed to contain the column names.
    This version uses DictReader so that all values are treated as strings,
    preserving any leading zeros.
    """
    # Open the CSV file for reading
    with open(csv_filename, 'r', encoding='utf-8') as csv_file:
        reader = csv.DictReader(csv_file)
        # Retrieve header names from the CSV file
        headers = reader.fieldnames

        # Open the output SQL file for writing
        with open(sql_filename, 'w', encoding='utf-8') as sql_file:
            for row in reader:
                # Prepare a list for the values
                values = []
                for header in headers:
                    # Retrieve the value as a string (it should already be a string)
                    value = row[header]
                    # Escape single quotes by doubling them
                    value = value.replace("'", "''")
                    # Wrap the value in single quotes to preserve formatting
                    values.append(f"'{value}'")

                # Build the SQL INSERT command
                columns = ", ".join(headers)
                values_str = ", ".join(values)
                sql_command = f"INSERT INTO {table_name} ({columns}) VALUES ({values_str});\n"
                # Write the command to the output file
                sql_file.write(sql_command)


def process_data_folder(data_folder, output_folder):
    """
    Iterates over each CSV file in the specified folder,
    converts it to SQL INSERT commands, and saves the output to the output folder.
    """
    # Create the output folder if it doesn't exist
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    # Iterate over all files in the data folder
    for filename in os.listdir(data_folder):
        if filename.endswith('.csv'):
            csv_path = os.path.join(data_folder, filename)
            # Use the file name (without the last underscore part) as the table name
            table_name = '_'.join(filename.split('_')[:-1])
            # Define the SQL output file name with .sql extension
            sql_filename = os.path.splitext(filename)[0] + '.sql'
            sql_path = os.path.join(output_folder, sql_filename)
            # Convert CSV to SQL INSERT commands
            csv_to_sql_insert(csv_path, table_name, sql_path)
            print(f"Converted {csv_path} to {sql_path}")


if __name__ == '__main__':
    # Folder containing CSV files
    data_folder = input("Enter the folder path containing CSV files: ")
    # Folder to store SQL INSERT command files
    output_folder = input("Enter the folder path to store SQL files: ")
    process_data_folder(data_folder, output_folder)
