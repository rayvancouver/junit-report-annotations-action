package example;

import org.junit.jupiter.api.Test;

/**
 *
 */
public class ErrorTest {

	@Test
	void success() {
		throw new RuntimeException("Oops");
	}
}
