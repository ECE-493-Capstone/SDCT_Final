import { render } from "@testing-library/react";
import App from "../App";
import '@testing-library/jest-dom'

test('Renders App', () => {
    render(<App />);
    expect(true).toBeTruthy();
});