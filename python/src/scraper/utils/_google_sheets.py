"""
notation.py

Description:
  - Contains functions for converting between different Google Sheet notation formats.

Functions:
  - col_from_index(index): Converts a column index (1-based) to a column letter (A, B, C, ...).
  - index_from_col(letter): Converts a column letter (A, B, C, ...) to a 1-based column index.
  - cell_to_a1(row_index, col_index): Converts a row and column index to a cell reference (A1, B2, C3, ...).
  - a1_to_cell(cell_ref): Converts a cell reference (A1, B2, C3, ...) to a row and column index tuple.
  - range_to_array(range_str): Converts a range string (B3:E7) to a 4-element array representing the start row, start column, number of rows, and number of columns.
  - array_to_range(arr): Converts a 4-element array representing a range to a range string (B3:E7).

Usages:
  - col_from_index(3)  # Returns "C"
  - index_from_col("D")  # Returns 4
  - cell_to_a1(5, 3)  # Returns "D5"
  - a1_to_cell("C5")   # Returns (5, 3)
  - range_to_array("B3:E7")  # Returns [3, 2, 5, 4]
  - array_to_range([3, 2, 5, 4])  # Returns "B3:E7"
"""

import math
import re

def col_from_index(index):
  """
  Converts a column index (1-based) to a column letter (A, B, C, ...).

  Args:
      index (int): The 1-based column index.

  Returns:
      str: The corresponding column letter.
  """
  temp = ""
  letter = ""
  while index > 0:
    temp = (index - 1) % 26
    letter = chr(temp + 65) + letter
    index = (index - temp - 1) // 26
  return letter

def index_from_col(letter):
  """
  Converts a column letter (A, B, C, ...) to a 1-based column index.

  Args:
      letter (str): The column letter.

  Returns:
      int: The corresponding 1-based column index.
  """
  index = 0
  length = len(letter)
  for i in range(length):
    index += (ord(letter[i]) - 64) * 26 ** (length - i - 1)
  return index

def cell_to_a1(row_index, col_index):
  """
  Converts a row and column index to a cell reference (A1, B2, C3, ...).

  Args:
      row_index (int): The row index.
      col_index (int): The column index.

  Returns:
      str: The corresponding cell reference.
  """
  cells = [str(row_index)]
  total_alphabets = ord("Z") - ord("A") + 1
  block = col_index - 1
  while block >= 0:
    cells.insert(0, chr((block % total_alphabets) + ord("A")))
    block = math.floor(block / total_alphabets) - 1
  return "".join(cells)

def a1_to_cell(cell_ref):
  """
  Converts a cell reference (A1, B2, C3, ...) to a row and column index tuple,
  handling cases where the row number might be missing.

  Args:
      cell_ref (str): The cell reference.

  Returns:
      tuple: A tuple containing the row index and column index,
             or None if the cell reference format is invalid.
  """
  if isinstance(cell_ref, list):
    return cell_ref

  # Improved regular expression for flexibility:
  matched = re.search(r"([A-Z]+)([0-9]*)", cell_ref.upper())
  if not matched:
    return None  # Return None for invalid cell references

  col_name, row = matched.groups()
  characters = ord("Z") - ord("A") + 1
  column_index = 0
  for i in range(len(col_name)):
    column_index += (ord(col_name[i]) - ord("A") + 1) * characters ** (len(col_name) - i - 1)

  # Handle missing row number gracefully:
  if not row:
    return None  # Indicate invalid if row is missing

  return (int(row), column_index)

def range_to_array(range_str):
  """
  Converts a range string (B3:E7) to a 4-element array representing the start row, start column, number of rows, and number of columns.

  Args:
      range_str (str): The range string.

  Returns:
      list: A 4-element array representing the range.
  """
  cells = range_str.split(":")
  start_cell = a1_to_cell(cells[0])
  end_cell = a1_to_cell(cells[1]) if len(cells) > 1 else None
  return [start_cell[0], start_cell[1], end_cell[0] - start_cell[0] + 1, end_cell[1] - start_cell[1] + 1]

def array_to_range(arr):
  """
  Converts a 4-element array representing a range to a range string (B3:E7).

  Args:
      arr (list): A 4-element array representing the range.

  Returns:
      str: The corresponding range string.
  """
  return f"{cell_to_a1(arr[0], arr[1])}:{cell_to_a1(arr[0] + arr[2] - 1, arr[1] + arr[3] - 1)}"

def default_arrays_range(range_notation, default=""):
  """
  Creates a 2D array of default values based on a range notation (string or array).

  Args:
      range_notation (str or list): The range notation.
      default (any): The default value for each cell.

  Returns:
      list: A 2D array of default values.
  """
  if isinstance(range_notation, str):
    range_notation = range_to_array(range_notation)

  defaults = []
  for i in range(range_notation[2]):
    row = []
    for j in range(range_notation[3]):
      row.append(default)
    defaults.append(row)

  return defaults

## ** Query

import requests
import os

def _fetch_arrs_by_query(query, sheet_name, spreadsheet_id=None):
    """
    Fetch arrays from a Google Sheet by query using requests library.

    Args:
        query (str): Google Sheets query, e.g., `SELECT A, B, D WHERE A='a1', B='b2'`.
        sheet_name (str): Sheet name.
        spreadsheet_id (str, optional): Spreadsheet ID. Default is the active spreadsheet.

    Returns:
        list: List of arrays representing the fetched data.
    """
    if not spreadsheet_id:
        spreadsheet_id = os.environ.get('SPREADSHEET_ID')  # Get from environment variable

    # Get OAuth token from credentials
    credentials = service_account.Credentials.from_service_account_file('credentials.json')
    authorized_session = requests.Session(auth=credentials)

    # Construct URL
    url = f"https://docs.google.com/spreadsheets/d/{spreadsheet_id}/gviz/tq?gid={sheet_name}&tqx=out:csv&tq={query}"

    # Send request and parse CSV response
    response = authorized_session.get(url)
    if response.status_code == 200:
        return [list(row) for row in response.text.splitlines()[1:]]
    else:
        print(f"Error fetching data: {response.status_code}")
        return []

if __name__ == "__main__":
  # Example usages
  print(col_from_index(3))  # Output: "C"
  print(index_from_col("D"))  # Output: 4
  print(cell_to_a1(5, 3))  # Output: "D5"
  print(a1_to_cell("C5"))   # Output: (5, 3)
  print(range_to_array("B3:E7"))  # Output: [3, 2, 5, 4]
  print(array_to_range([3, 2, 5, 4]))  # Output: "B3:E7"
  print(default_arrays_range("B3:F5", "X"))  # Output: [['X', 'X', 'X', 'X', 'X'], ['X', 'X', 'X', 'X', 'X'], ['X', 'X', 'X', 'X', 'X']]
