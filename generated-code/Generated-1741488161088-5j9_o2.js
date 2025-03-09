Here is the code:
```
import streamlit as st

st.title("My App")
st.write("Welcome to my app!")

with st.expander("About"):
    st.write("This is a sample app built with Streamlit.")

with st.expander("Features"):
    st.write("This app has the following features:")
    st.write("- A simple title")
    st.write("- A brief welcome message")
    st.write("- An expander with information about the app")

if st.button("Click me!"):
    st.write("You clicked the button!")

st.write("This is the end of the app.")
