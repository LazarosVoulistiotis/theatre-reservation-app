import { StyleSheet, Text, TextInput, View } from "react-native";

/*
  Reusable input field.

  This component standardises form inputs across authentication,
  search and reservation screens, keeping the UI consistent and
  easier to maintain.
*/
export default function AppInput({
                                     label,
                                     value,
                                     onChangeText,
                                     placeholder,
                                     secureTextEntry = false,
                                     keyboardType = "default",
                                     autoCapitalize = "none",
                                     autoCorrect = false,
                                     returnKeyType = "done",
                                 }) {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>

            <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#9ca3af"
                secureTextEntry={secureTextEntry}
                keyboardType={keyboardType}
                autoCapitalize={autoCapitalize}
                autoCorrect={autoCorrect}
                returnKeyType={returnKeyType}
                accessibilityLabel={label}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    /*
      Each input has consistent spacing so forms remain clean
      and readable across different screens.
    */
    container: {
        marginVertical: 8,
    },

    label: {
        fontSize: 14,
        fontWeight: "800",
        marginBottom: 6,
        color: "#111827",
    },

    /*
      White input fields on a neutral background improve contrast
      and make form sections easy to scan.
    */
    input: {
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 12,
        paddingVertical: 13,
        paddingHorizontal: 14,
        fontSize: 16,
        color: "#111827",
    },
});