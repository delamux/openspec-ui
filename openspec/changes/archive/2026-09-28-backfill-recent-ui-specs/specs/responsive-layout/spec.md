## ADDED Requirements

### Requirement: Rendered documents use a wide reading width

In the change viewer, the Proposal, Specs, Design and Tasks content SHALL be centred in the content column with a maximum width of 1024px. Documents on the Project information tab, which often hold wide tables, SHALL take 90% of the content column. At viewport widths of 768px or less, both SHALL take the full width of the column.

#### Scenario: Desktop change viewer

- **WHEN** the viewport is 1600px wide and a change's proposal is shown
- **THEN** the rendered proposal is centred and no wider than 1024px

#### Scenario: Desktop project document

- **WHEN** the viewport is 1600px wide and a document is open on the Project information tab
- **THEN** the document takes 90% of the content column

#### Scenario: Tablet and phone widths

- **WHEN** the viewport is 768px wide or less
- **THEN** change viewer content and project documents both take the full width of the content column
